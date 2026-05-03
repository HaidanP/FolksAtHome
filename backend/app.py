import os
import re
import base64
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_conn

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads', 'avatars')
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _ensure_schema():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("ALTER TABLE fah_tasks ADD COLUMN IF NOT EXISTS duration_hours FLOAT DEFAULT 1.0")
        cur.execute("ALTER TABLE fah_member_details ADD COLUMN IF NOT EXISTS bio TEXT")
        conn.commit()
        cur.close()
    except Exception:
        pass
    finally:
        conn.close()


_ensure_schema()


def _save_avatar(data_url: str, public_id: str) -> str | None:
    try:
        m = re.match(r'data:image/(\w+);base64,(.+)', data_url, re.DOTALL)
        if not m:
            return None
        ext = 'jpg' if m.group(1) in ('jpeg', 'jpg') else m.group(1)
        img_bytes = base64.b64decode(m.group(2))
        filename = f"{public_id}.{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), 'wb') as fh:
            fh.write(img_bytes)
        return f"/api/avatars/{filename}"
    except Exception:
        return None


@app.route("/api/avatars/<path:filename>")
def serve_avatar(filename):
    return send_from_directory(UPLOAD_DIR, filename)


# ── helpers ───────────────────────────────────────────────────────────────────

def _next_public_id(cursor, role: str) -> str:
    prefix = "V" if role == "volunteer" else "M"
    cursor.execute(
        "SELECT public_id FROM fah_users WHERE role=%s ORDER BY user_id DESC LIMIT 1",
        (role,)
    )
    row = cursor.fetchone()
    if row:
        try:
            num = int(row["public_id"][1:]) + 1
        except ValueError:
            num = 1
    else:
        num = 1
    return f"{prefix}{num:03d}"


def _user_dict(row: dict) -> dict:
    return {
        "id":        row["public_id"],
        "role":      row["role"],
        "email":     row["email"],
        "firstName": row["first_name"],
        "lastName":  row["last_name"],
        "avatarFile": row.get("avatar_file"),
        "status":    row["status"],
    }


def _dt_parts(scheduled_at):
    if scheduled_at is None:
        return '', '00:00'
    if hasattr(scheduled_at, 'strftime'):
        return scheduled_at.strftime('%Y-%m-%d'), scheduled_at.strftime('%H:%M')
    s = str(scheduled_at)
    parts = s.split(' ')
    return parts[0], parts[1][:5] if len(parts) > 1 else '00:00'


def _date_str(val):
    if val is None:
        return ''
    if hasattr(val, 'strftime'):
        return val.strftime('%Y-%m-%d')
    return str(val)[:10]


def _task_to_dict(row: dict) -> dict:
    sched_date, sched_time = _dt_parts(row.get('scheduled_at'))
    m_first = row.get('m_first') or ''
    m_last  = row.get('m_last')  or ''
    member_name = (f"{m_first[0]}. {m_last}".strip() if m_first else m_last)
    v_first = row.get('v_first') or ''
    v_last  = row.get('v_last')  or ''
    claimed_by_name = (f"{v_first[0]}. {v_last}".strip() if v_first else None)
    return {
        'id':             row['task_id'],
        'memberId':       row.get('member_id', ''),
        'memberName':     member_name,
        'memberFullName': f"{m_first} {m_last}".strip(),
        'memberAge':      row.get('member_age'),
        'memberTown':     row.get('member_town'),
        'memberAvatar':   row.get('member_avatar'),
        'memberBio':      row.get('member_bio'),
        'category':       row.get('category', ''),
        'description':    row.get('description', ''),
        'scheduledDate':  sched_date,
        'scheduledTime':  sched_time,
        'durationHours':  float(row.get('duration_hours') or 1.0),
        'status':         row.get('status', 'Open'),
        'postedDate':     _date_str(row.get('created_at')),
        'claimedById':    row.get('claimed_by_id'),
        'claimedByName':  claimed_by_name,
        'claimedByAvatar': row.get('claimed_by_avatar'),
    }


_TASK_QUERY = """
    SELECT t.task_id,
      m.public_id AS member_id,
      m.first_name AS m_first, m.last_name AS m_last,
      TIMESTAMPDIFF(YEAR, m.dob, CURDATE()) AS member_age,
      m.city AS member_town, m.avatar_file AS member_avatar,
      md.bio AS member_bio,
      t.category, t.description, t.scheduled_at,
      COALESCE(t.duration_hours, 1.0) AS duration_hours,
      t.status, t.created_at,
      cv.public_id AS claimed_by_id,
      cv.first_name AS v_first, cv.last_name AS v_last,
      cv.avatar_file AS claimed_by_avatar
    FROM fah_tasks t
    JOIN fah_users m ON t.member_id = m.user_id
    LEFT JOIN fah_member_details md ON m.user_id = md.member_id
    LEFT JOIN fah_volunteer_requests cvr
      ON t.task_id = cvr.task_id AND cvr.status = 'Confirmed'
    LEFT JOIN fah_users cv ON cvr.volunteer_id = cv.user_id
"""


def _build_requests(cur, task_ids: list) -> dict:
    if not task_ids:
        return {}
    placeholders = ','.join(['%s'] * len(task_ids))
    cur.execute(f"""
        SELECT vr.request_id, vr.task_id, vr.status,
          DATE(vr.created_at) AS requested_at,
          v.public_id AS volunteer_id,
          v.first_name AS v_first, v.last_name AS v_last,
          v.avatar_file AS vol_avatar,
          vd.bio AS vol_bio,
          GROUP_CONCAT(vs.skill ORDER BY vs.skill SEPARATOR ', ') AS vol_skills
        FROM fah_volunteer_requests vr
        JOIN fah_users v ON vr.volunteer_id = v.user_id
        LEFT JOIN fah_volunteer_details vd ON v.user_id = vd.volunteer_id
        LEFT JOIN fah_volunteer_skills vs  ON v.user_id = vs.volunteer_id
        WHERE vr.task_id IN ({placeholders}) AND vr.status IN ('Pending','Confirmed')
        GROUP BY vr.request_id, v.user_id
        ORDER BY vr.created_at ASC
    """, tuple(task_ids))
    by_task: dict = {}
    for req in cur.fetchall():
        tid = req['task_id']
        vf, vl = req['v_first'] or '', req['v_last'] or ''
        by_task.setdefault(tid, []).append({
            'requestId':         req['request_id'],
            'taskId':            req['task_id'],
            'volunteerId':       req['volunteer_id'],
            'volunteerFirstName': vf,
            'volunteerFullName':  f"{vf} {vl}".strip(),
            'volunteerAvatar':   req['vol_avatar'],
            'volunteerBio':      req['vol_bio'],
            'volunteerSkills':   req['vol_skills'],
            'requestedAt':       _date_str(req['requested_at']),
            'status':            req['status'],
        })
    return by_task


# ── GET /api/tasks ─────────────────────────────────────────────────────────────

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(_TASK_QUERY + " WHERE t.status IN ('Open','Claimed') ORDER BY t.scheduled_at ASC")
        rows = cur.fetchall()
        return jsonify([_task_to_dict(r) for r in rows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── GET /api/volunteers/<vol_id>/my-requests ───────────────────────────────────

@app.route("/api/volunteers/<vol_id>/my-requests", methods=["GET"])
def get_volunteer_requests(vol_id):
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT vr.request_id, vr.task_id, vr.status,
              DATE(vr.created_at) AS requested_at
            FROM fah_volunteer_requests vr
            JOIN fah_users v ON vr.volunteer_id = v.user_id AND v.public_id = %s
            WHERE vr.status IN ('Pending','Confirmed')
        """, (vol_id,))
        rows = cur.fetchall()
        return jsonify([{
            'requestId':   r['request_id'],
            'taskId':      r['task_id'],
            'status':      r['status'],
            'requestedAt': _date_str(r['requested_at']),
        } for r in rows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── POST /api/tasks/<task_id>/request ─────────────────────────────────────────

@app.route("/api/tasks/<int:task_id>/request", methods=["POST"])
def create_request(task_id):
    data = request.get_json(force=True)
    vol_id = data.get('volunteerId', '').strip()
    if not vol_id:
        return jsonify({'error': 'volunteerId required'}), 400

    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT user_id FROM fah_users WHERE public_id=%s AND role='volunteer'", (vol_id,))
        vol = cur.fetchone()
        if not vol:
            return jsonify({'error': 'Volunteer not found'}), 404

        cur.execute("SELECT status FROM fah_tasks WHERE task_id=%s", (task_id,))
        task = cur.fetchone()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        if task['status'] != 'Open':
            return jsonify({'error': 'Task is no longer open'}), 409

        cur.execute("""
            INSERT INTO fah_volunteer_requests (task_id, volunteer_id, status)
            VALUES (%s, %s, 'Pending')
            ON DUPLICATE KEY UPDATE status = IF(status='Cancelled','Pending',status)
        """, (task_id, vol['user_id']))
        conn.commit()
        return jsonify({'ok': True}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── DELETE /api/tasks/<task_id>/request ───────────────────────────────────────

@app.route("/api/tasks/<int:task_id>/request", methods=["DELETE"])
def cancel_request(task_id):
    data = request.get_json(force=True, silent=True) or {}
    vol_id = data.get('volunteerId', '').strip()
    if not vol_id:
        return jsonify({'error': 'volunteerId required'}), 400

    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT user_id FROM fah_users WHERE public_id=%s", (vol_id,))
        vol = cur.fetchone()
        if not vol:
            return jsonify({'error': 'Volunteer not found'}), 404

        cur.execute("""
            UPDATE fah_volunteer_requests
            SET status='Cancelled'
            WHERE task_id=%s AND volunteer_id=%s AND status='Pending'
        """, (task_id, vol['user_id']))
        conn.commit()
        return jsonify({'ok': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── GET /api/members/<member_id>/tasks ────────────────────────────────────────

@app.route("/api/members/<member_id>/tasks", methods=["GET"])
def get_member_tasks(member_id):
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            _TASK_QUERY + " WHERE m.public_id=%s AND t.status IN ('Open','Claimed') ORDER BY t.scheduled_at ASC",
            (member_id,)
        )
        tasks = cur.fetchall()
        if not tasks:
            return jsonify([])
        task_ids = [t['task_id'] for t in tasks]
        by_task = _build_requests(cur, task_ids)
        result = []
        for t in tasks:
            d = _task_to_dict(t)
            d['requests'] = by_task.get(t['task_id'], [])
            result.append(d)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── POST /api/members/<member_id>/tasks ───────────────────────────────────────

@app.route("/api/members/<member_id>/tasks", methods=["POST"])
def create_task(member_id):
    data = request.get_json(force=True)
    required = ('category', 'description', 'scheduledDate', 'scheduledTime', 'durationHours')
    if not all(data.get(k) for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT user_id FROM fah_users WHERE public_id=%s AND role='member'", (member_id,))
        mem = cur.fetchone()
        if not mem:
            return jsonify({'error': 'Member not found'}), 404

        scheduled = f"{data['scheduledDate']} {data['scheduledTime']}:00"
        cur.execute("""
            INSERT INTO fah_tasks (member_id, category, description, scheduled_at, duration_hours, status)
            VALUES (%s, %s, %s, %s, %s, 'Open')
        """, (mem['user_id'], data['category'], data['description'],
              scheduled, float(data['durationHours'])))
        task_id = cur.lastrowid
        conn.commit()

        # Return the new task with member info
        cur.execute(_TASK_QUERY + " WHERE t.task_id=%s", (task_id,))
        row = cur.fetchone()
        d = _task_to_dict(row)
        d['requests'] = []
        return jsonify(d), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── DELETE /api/tasks/<task_id>  (cancel a task) ──────────────────────────────

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE fah_tasks SET status='Cancelled' WHERE task_id=%s AND status IN ('Open','Claimed')",
            (task_id,)
        )
        cur.execute(
            "UPDATE fah_volunteer_requests SET status='Cancelled' WHERE task_id=%s AND status='Pending'",
            (task_id,)
        )
        conn.commit()
        return jsonify({'ok': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── GET /api/members/<member_id>/history ──────────────────────────────────────

@app.route("/api/members/<member_id>/history", methods=["GET"])
def get_member_history(member_id):
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT t.task_id, t.category, t.description,
              DATE(t.updated_at) AS completed_date,
              CONCAT(v.first_name, ' ', v.last_name) AS volunteer_name,
              v.avatar_file AS volunteer_avatar
            FROM fah_tasks t
            JOIN fah_users m ON t.member_id = m.user_id AND m.public_id = %s
            LEFT JOIN fah_volunteer_requests vr
              ON t.task_id = vr.task_id AND vr.status = 'Confirmed'
            LEFT JOIN fah_users v ON vr.volunteer_id = v.user_id
            WHERE t.status = 'Completed'
            ORDER BY t.updated_at DESC
        """, (member_id,))
        rows = cur.fetchall()
        return jsonify([{
            'id':               r['task_id'],
            'category':         r['category'],
            'description':      r['description'],
            'completedDate':    _date_str(r['completed_date']),
            'volunteerName':    r['volunteer_name'] or 'Unknown',
            'volunteerAvatar':  r['volunteer_avatar'],
        } for r in rows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── POST /api/requests/<request_id>/confirm ───────────────────────────────────

@app.route("/api/requests/<int:request_id>/confirm", methods=["POST"])
def confirm_request(request_id):
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT task_id FROM fah_volunteer_requests WHERE request_id=%s", (request_id,))
        req = cur.fetchone()
        if not req:
            return jsonify({'error': 'Request not found'}), 404
        task_id = req['task_id']

        cur.execute(
            "UPDATE fah_volunteer_requests SET status='Confirmed' WHERE request_id=%s",
            (request_id,)
        )
        cur.execute(
            "UPDATE fah_volunteer_requests SET status='Cancelled' WHERE task_id=%s AND request_id!=%s AND status='Pending'",
            (task_id, request_id)
        )
        cur.execute(
            "UPDATE fah_tasks SET status='Claimed' WHERE task_id=%s",
            (task_id,)
        )
        conn.commit()
        return jsonify({'ok': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── POST /api/requests/<request_id>/decline ───────────────────────────────────

@app.route("/api/requests/<int:request_id>/decline", methods=["POST"])
def decline_request(request_id):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE fah_volunteer_requests SET status='Cancelled' WHERE request_id=%s",
            (request_id,)
        )
        conn.commit()
        return jsonify({'ok': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close(); conn.close()


# ── volunteer registration ─────────────────────────────────────────────────────

@app.route("/api/auth/register/volunteer", methods=["POST"])
def register_volunteer():
    data = request.get_json(force=True)
    required = ("firstName", "lastName", "email", "password")
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)

        cur.execute("SELECT user_id FROM fah_users WHERE email=%s", (data["email"].lower(),))
        if cur.fetchone():
            return jsonify({"error": "Email already registered"}), 409

        public_id = _next_public_id(cur, "volunteer")
        pw_hash   = generate_password_hash(data["password"])

        cur.execute("""
            INSERT INTO fah_users
              (public_id, role, email, password_hash, first_name, last_name,
               dob, home_phone, cell_phone, street_address, city, state, zip, status)
            VALUES (%s,'volunteer',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'Approved')
        """, (
            public_id,
            data["email"].lower(),
            pw_hash,
            data["firstName"],
            data["lastName"],
            data.get("dob") or None,
            data.get("homePhone") or None,
            data.get("cellPhone") or None,
            data.get("streetAddress") or None,
            data.get("city") or None,
            data.get("state") or None,
            data.get("zip") or None,
        ))
        user_id = cur.lastrowid

        cur.execute("""
            INSERT INTO fah_volunteer_details
              (volunteer_id, bio, why_volunteer, ec_name, ec_phone, ec_relation,
               has_license, has_transport, bg_check, frequency, start_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            user_id,
            data.get("bio") or None,
            data.get("whyVolunteer") or None,
            data.get("ecName") or None,
            data.get("ecPhone") or None,
            data.get("ecRelation") or None,
            1 if data.get("hasLicense") else 0,
            1 if data.get("hasTransport") else 0,
            1 if data.get("bgCheck") else 0,
            data.get("frequency") or None,
            data.get("startDate") or None,
        ))

        for slot in (data.get("availability") or []):
            cur.execute(
                "INSERT IGNORE INTO fah_volunteer_availability (volunteer_id, slot) VALUES (%s,%s)",
                (user_id, slot)
            )

        for skill in (data.get("skills") or []):
            cur.execute(
                "INSERT IGNORE INTO fah_volunteer_skills (volunteer_id, skill) VALUES (%s,%s)",
                (user_id, skill)
            )

        avatar_data = data.get("avatarData") or ""
        if avatar_data:
            filename = _save_avatar(avatar_data, public_id)
            if filename:
                cur.execute("UPDATE fah_users SET avatar_file=%s WHERE user_id=%s", (filename, user_id))

        conn.commit()

        cur.execute("SELECT * FROM fah_users WHERE user_id=%s", (user_id,))
        user_row = cur.fetchone()
        return jsonify(_user_dict(user_row)), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ── member registration ────────────────────────────────────────────────────────

@app.route("/api/auth/register/member", methods=["POST"])
def register_member():
    data = request.get_json(force=True)
    required = ("firstName", "lastName", "email", "password")
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)

        cur.execute("SELECT user_id FROM fah_users WHERE email=%s", (data["email"].lower(),))
        if cur.fetchone():
            return jsonify({"error": "Email already registered"}), 409

        public_id = _next_public_id(cur, "member")
        pw_hash   = generate_password_hash(data["password"])

        cur.execute("""
            INSERT INTO fah_users
              (public_id, role, email, password_hash, first_name, last_name,
               dob, home_phone, cell_phone, street_address, city, state, zip, status)
            VALUES (%s,'member',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'Pending')
        """, (
            public_id,
            data["email"].lower(),
            pw_hash,
            data["firstName"],
            data["lastName"],
            data.get("dob") or None,
            data.get("homePhone") or None,
            data.get("cellPhone") or None,
            data.get("streetAddress") or None,
            data.get("city") or None,
            data.get("state") or None,
            data.get("zip") or None,
        ))
        user_id = cur.lastrowid

        cur.execute("""
            INSERT INTO fah_member_details (member_id, plan, ec_name, ec_phone, ec_relation)
            VALUES (%s,%s,%s,%s,%s)
        """, (
            user_id,
            data.get("plan") or None,
            data.get("ecName") or None,
            data.get("ecPhone") or None,
            data.get("ecRelation") or None,
        ))

        for method in (data.get("contactMethods") or []):
            cur.execute(
                "INSERT IGNORE INTO fah_member_contact_methods (member_id, method) VALUES (%s,%s)",
                (user_id, method)
            )

        for service in (data.get("services") or []):
            cur.execute(
                "INSERT IGNORE INTO fah_member_services (member_id, service) VALUES (%s,%s)",
                (user_id, service)
            )

        avatar_data = data.get("avatarData") or ""
        if avatar_data:
            filename = _save_avatar(avatar_data, public_id)
            if filename:
                cur.execute("UPDATE fah_users SET avatar_file=%s WHERE user_id=%s", (filename, user_id))

        conn.commit()

        cur.execute("SELECT * FROM fah_users WHERE user_id=%s", (user_id,))
        user_row = cur.fetchone()
        return jsonify(_user_dict(user_row)), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ── login ──────────────────────────────────────────────────────────────────────

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email    = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""
    role     = data.get("role")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM fah_users WHERE email=%s", (email,))
        row = cur.fetchone()

        if not row or not check_password_hash(row["password_hash"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        if role and row["role"] != role:
            label = "members" if role == "member" else "volunteers"
            return jsonify({"error": f"This login is for {label} only"}), 403

        return jsonify(_user_dict(row)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    app.run(port=5001, debug=True)

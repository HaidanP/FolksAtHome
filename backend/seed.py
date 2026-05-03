"""
One-time seed: inserts the 12 volunteers + 15 members from src/data/users.ts
into the live MariaDB database.  Safe to re-run — uses INSERT IGNORE.
"""
from werkzeug.security import generate_password_hash
from db import get_conn

VOLUNTEERS = [
    ("V001","athom0@sewanee.edu",       "Volunteer#001","Alex",    "Thompson",  "Approved"),
    ("V002","praghav0@sewanee.edu",     "Volunteer#002","Priya",   "Raghavan",  "Approved"),
    ("V003","mlee1@sewanee.edu",        "Volunteer#003","Marcus",  "Lee",       "Pending"),
    ("V004","sberg0@sewanee.edu",       "Volunteer#004","Sophie",  "Bergstrom", "Approved"),
    ("V005","jwash0@sewanee.edu",       "Volunteer#005","Jamal",   "Washington","Approved"),
    ("V006","cmend0@sewanee.edu",       "Volunteer#006","Carolina","Mendez",    "Approved"),
    ("V007","ebrigg0@sewanee.edu",      "Volunteer#007","Ethan",   "Briggs",    "Rejected"),
    ("V008","lfoster@gmail.com",        "Volunteer#008","Linda",   "Foster",    "Approved"),
    ("V009","rpenn@yahoo.com",          "Volunteer#009","Richard", "Penn",      "Approved"),
    ("V010","srmaryclaire@stmarys.org", "Volunteer#010","Sr. Mary","Claire",    "Approved"),
    ("V011","kbrigg0@sewanee.edu",      "Volunteer#011","Kaylee",  "Briggs",    "Approved"),
    ("V012","dokon0@sewanee.edu",       "Volunteer#012","David",   "Okonkwo",   "Approved"),
]

MEMBERS = [
    ("M001","ewhitaker@folksathome.org",  "Member#M001","Eleanor",  "Whitaker"),
    ("M002","hpennington@folksathome.org","Member#M002","Harold",   "Pennington"),
    ("M003","dpennington@folksathome.org","Member#M003","Doris",    "Pennington"),
    ("M004","mboyd@folksathome.org",      "Member#M004","Margaret", "Boyd"),
    ("M005","wdillard@folksathome.org",   "Member#M005","Walter",   "Dillard"),
    ("M006","bramsay@folksathome.org",    "Member#M006","Beatrice", "Ramsay"),
    ("M007","ecathey@folksathome.org",    "Member#M007","Ernest",   "Cathey"),
    ("M008","lfults@folksathome.org",     "Member#M008","Lillian",  "Fults"),
    ("M009","rgipson@folksathome.org",    "Member#M009","Robert",   "Gipson"),
    ("M010","jhaight@folksathome.org",    "Member#M010","Josephine","Haight"),
    ("M011","chaight@folksathome.org",    "Member#M011","Charles",  "Haight"),
    ("M012","vmcbee@folksathome.org",     "Member#M012","Virginia", "McBee"),
    ("M013","tquinn@folksathome.org",     "Member#M013","Thomas",   "Quinn"),
    ("M014","rstagg@folksathome.org",     "Member#M014","Ruth",     "Stagg"),
    ("M015","hyarbrough@folksathome.org", "Member#M015","Howard",   "Yarbrough"),
]

def seed():
    conn = get_conn()
    cur  = conn.cursor()

    for (pid, email, pw, first, last, status) in VOLUNTEERS:
        pw_hash = generate_password_hash(pw)
        cur.execute("""
            INSERT IGNORE INTO fah_users
              (public_id, role, email, password_hash, first_name, last_name, status)
            VALUES (%s,'volunteer',%s,%s,%s,%s,%s)
        """, (pid, email.lower(), pw_hash, first, last, status))

        cur.execute("SELECT user_id FROM fah_users WHERE public_id=%s", (pid,))
        row = cur.fetchone()
        if row:
            cur.execute(
                "INSERT IGNORE INTO fah_volunteer_details (volunteer_id) VALUES (%s)",
                (row[0],)
            )

    for (pid, email, pw, first, last) in MEMBERS:
        pw_hash = generate_password_hash(pw)
        cur.execute("""
            INSERT IGNORE INTO fah_users
              (public_id, role, email, password_hash, first_name, last_name, status)
            VALUES (%s,'member',%s,%s,%s,%s,'Approved')
        """, (pid, email.lower(), pw_hash, first, last))

        cur.execute("SELECT user_id FROM fah_users WHERE public_id=%s", (pid,))
        row = cur.fetchone()
        if row:
            cur.execute(
                "INSERT IGNORE INTO fah_member_details (member_id) VALUES (%s)",
                (row[0],)
            )

    conn.commit()
    cur.close()
    conn.close()
    print("Seed complete.")

if __name__ == "__main__":
    seed()

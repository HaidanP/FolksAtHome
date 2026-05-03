"""
Seed tasks, volunteer requests, and completed history into the database.
Also updates member dobs/cities/bios and volunteer bios/skills.
Safe to re-run — clears and re-inserts tasks.
"""
from db import get_conn

MEMBER_META = {
    'M001': {'dob': '1944-03-15', 'city': 'Sewanee',    'bio': 'Uses a walker and is hard of hearing. Please speak clearly and offer a steady arm when arriving.'},
    'M002': {'dob': '1948-07-22', 'city': 'Sewanee',    'bio': 'Post-stroke with limited driving ability. Part of a 2-member household with his wife Doris.'},
    'M003': {'dob': '1950-11-08', 'city': 'Sewanee',    'bio': 'Primary caregiver for Harold. Support that gives her a break is especially meaningful.'},
    'M004': {'dob': '1937-01-30', 'city': 'Sewanee',    'bio': 'Widow with low vision. Appreciates patience and a friendly presence.'},
    'M005': {'dob': '1952-05-14', 'city': 'Sewanee',    'bio': 'Active and independent. Uses community programs only — no personal care needed.'},
    'M006': {'dob': '1941-09-03', 'city': 'Monteagle',  'bio': 'Beginning stages of dementia. Consistency and familiar faces help her feel at ease.'},
    'M007': {'dob': '1935-02-17', 'city': 'Sewanee',    'bio': 'Hospice referral currently in process. Visits should be gentle and unhurried.'},
    'M008': {'dob': '1958-06-25', 'city': 'Sewanee',    'bio': 'A volunteer herself who joined primarily for community connection. Energetic and engaged.'},
    'M009': {'dob': '1946-10-12', 'city': 'Sewanee',    'bio': "Retired faculty member. His wife is in memory care — he values conversation and quiet company."},
    'M010': {'dob': '1949-04-08', 'city': 'Sewanee',    'bio': 'Diabetic; requires regular pharmacy runs. Part of a 2-member household with Charles.'},
    'M011': {'dob': '1947-08-19', 'city': 'Sewanee',    'bio': 'Has COPD. Part of a 2-member household with Josephine. Avoid strong scents on visits.'},
    'M012': {'dob': '1942-12-05', 'city': 'Sewanee',    'bio': 'Broke her hip in February and is still recovering. Moves slowly — allow extra time.'},
    'M013': {'dob': '1954-03-28', 'city': 'Monteagle',  'bio': 'Recent widower with isolation concerns. A warm, unhurried visit makes a real difference.'},
    'M014': {'dob': '1938-07-11', 'city': 'Sewanee',    'bio': 'Lives alone and is identified as a falls risk. Please check surroundings during visits.'},
    'M015': {'dob': '1951-01-20', 'city': 'Sewanee',    'bio': 'Active member who primarily uses programs and community services.'},
}

MEMBER_AVATARS = {
    'M001': 'M001_EleanorWhitaker.png',
    'M002': 'M002_HaroldPennington.png',
    'M003': 'M003_DorisPennington.png',
    'M004': 'M004_MargaretBoyd.png',
    'M005': 'M005_WalterDillard.png',
    'M006': 'M006_BeatriceRamsay.png',
    'M007': 'M007_ErnestCathey.png',
    'M008': 'M008_LillianFults.png',
    'M009': 'M009_RobertGipson.png',
    'M010': 'M010_JosephineHaight.png',
    'M011': 'M011_CharlesHaight.png',
    'M012': 'M012_VirginiaMcBee.png',
    'M013': 'M013_ThomasQuinn.png',
    'M014': 'M014_RuthStagg.png',
    'M015': 'M015_HowardYarbrough.png',
}

VOLUNTEER_META = {
    'V001': {
        'bio': 'Pre-med junior at Sewanee. Available for morning and weekend rides. Known for being patient and punctual — members consistently ask for him by name.',
        'avatar': 'V001_AlexThompson.png',
        'skills': ['Driving', 'Tech Support'],
    },
    'V002': {
        'bio': 'English sophomore at Sewanee with two semesters in the program. Loves reading aloud and long conversations. Has built lasting relationships with several members.',
        'avatar': 'V002_PriyaRaghavan.png',
        'skills': ['Friendly visits', 'Reading aloud'],
    },
    'V004': {
        'bio': "Senior at Sewanee and one of the program's most reliable drivers. Handles weekly pharmacy runs and appointment rides with a calm, caring approach.",
        'avatar': 'V004_SophieBergstrom.png',
        'skills': ['Driving', 'Pharmacy runs'],
    },
    'V005': {
        'bio': 'Computer science junior specializing in device setup, Wi-Fi troubleshooting, and walking members through new technology step by step — no rush, no jargon.',
        'avatar': 'V005_JamalWashington.png',
        'skills': ['Tech Support', 'Device setup'],
    },
    'V006': {
        'bio': 'Fluent Spanish speaker, junior at Sewanee. Especially valued by members whose families are Spanish-speaking. Warm, attentive, and culturally attuned.',
        'avatar': 'V006_CarolinaMendez.png',
        'skills': ['Friendly visits', 'Spanish-speaking'],
    },
    'V008': {
        'bio': "Retired nurse with 30 years in home and long-term care. One of the program's most trusted volunteers — deeply experienced with members who have complex health needs.",
        'avatar': 'V008_LindaFoster.png',
        'skills': ['Driving', 'Meal prep', 'Long-term care'],
    },
    'V009': {
        'bio': 'Retired contractor handling minor home repairs, safety checks, and outdoor tasks. Experienced with grab bars, smoke detectors, and other assistive home modifications.',
        'avatar': 'V009_RichardPenn.png',
        'skills': ['Home repair', 'Yard work'],
    },
    'V010': {
        'bio': 'Member of the Order of the Holy Cross at Sewanee. Provides companionship, prayer, and pastoral care. Especially meaningful to members facing serious illness or loss.',
        'avatar': 'V010_Sr.MaryClaire.png',
        'skills': ['Friendly visits', 'Pastoral care'],
    },
    'V011': {
        'bio': 'Creative writing junior with a gift for listening. Volunteers for memoir conversations and reading companionship — members say she makes them feel truly heard.',
        'avatar': 'V011_KayleeBriggs.png',
        'skills': ['Memoir writing', 'Reading'],
    },
    'V012': {
        'bio': 'Senior at Sewanee and a dedicated glass recycling volunteer. Also available for errands and local transportation. Dependable and always on time.',
        'avatar': 'V012_DavidOkonkwo.png',
        'skills': ['Driving', 'Glass recycling'],
    },
}

# Open tasks (status='Open')
TASKS = [
    ('M002', 'Errands',        'Pharmacy pickup at Village Drug',                          '2026-04-22 14:00:00', 1.0),
    ('M006', 'Transportation', 'Ride to memory clinic in Murfreesboro',                    '2026-04-28 08:00:00', 5.0),
    ('M009', 'Friendly Visit', 'Companionship — reads poetry, prefers quiet',              '2026-04-25 14:00:00', 1.5),
    ('M012', 'Transportation', 'Ride to physical therapy in Sewanee',                      '2026-04-25 10:00:00', 1.5),
    ('M014', 'Home Task',      'Change high smoke-detector batteries',                     '2026-04-26 10:00:00', 0.5),
    ('M002', 'Tech Support',   'iPad will not connect to wi-fi',                           '2026-04-24 16:00:00', 1.0),
    ('M015', 'Home Task',      'Help carrying winter clothes to attic',                    '2026-04-25 09:00:00', 1.0),
    ('M012', 'Errands',        'Pharmacy pickup — weekly insulin',                         '2026-04-25 14:00:00', 1.0),
]

# Claimed tasks (status='Claimed', with confirmed volunteer)
CLAIMED_TASKS = [
    ('M001', 'Transportation',  'Ride to cardiologist in Winchester',                      '2026-04-24 09:30:00', 2.0,  'V001'),
    ('M004', 'Friendly Visit',  'Weekly visit — loves to talk about gardening',            '2026-04-23 15:00:00', 1.0,  'V002'),
    ('M007', 'Tech Support',    'Help setting up new landline phone with large buttons',   '2026-04-22 10:00:00', 1.5,  'V005'),
    ('M010', 'Errands',         'Grocery shopping at Piggly Wiggly',                       '2026-04-22 11:00:00', 2.0,  'V004'),
    ('M012', 'Transportation',  'Ride to physical therapy in Sewanee',                     '2026-04-23 10:00:00', 1.5,  'V008'),
    ('M013', 'Friendly Visit',  'New member — needs welcome visit',                        '2026-04-24 13:00:00', 1.0,  'V010'),
    ('M001', 'Glass Recycling', 'Weekly glass recycling pickup',                           '2026-04-26 09:00:00', 0.5,  'V012'),
    ('M004', 'Friendly Visit',  'Read aloud — currently reading a mystery novel',          '2026-04-30 15:00:00', 1.0,  'V006'),
    ('M006', 'Friendly Visit',  "Spanish-speaking volunteer requested — member's late husband was from Mexico", '2026-04-27 14:00:00', 1.0, 'V011'),
    ('M009', 'Errands',         'Library pickup and drop-off',                             '2026-04-23 11:00:00', 2.0,  'V008'),
    ('M013', 'Transportation',  'Ride to Episcopal church, Sunday 10:30',                  '2026-04-26 10:00:00', 1.0,  'V002'),
    ('M014', 'Phone Check-In',  'Daily check-in call, 9 AM — recurring',                  '2026-04-23 09:00:00', 0.17, 'V008'),
]

# Pending volunteer requests on open tasks (seeded so member sees activity)
# Format: (task_description_substr, volunteer_public_id, created_at)
PENDING_REQUESTS = [
    ('Pharmacy pickup at Village Drug',               'V004', '2026-04-21'),
    ('Ride to memory clinic in Murfreesboro',          'V008', '2026-04-21'),
    ('Companionship — reads poetry',                   'V010', '2026-04-22'),
    ('Ride to physical therapy in Sewanee',            'V008', '2026-04-21'),  # T009
    ('Change high smoke-detector batteries',           'V009', '2026-04-22'),
    ('iPad will not connect to wi-fi',                 'V005', '2026-04-22'),
    ('Help carrying winter clothes to attic',          'V001', '2026-04-23'),
    ('Pharmacy pickup — weekly insulin',               'V012', '2026-04-23'),
]

# Completed history tasks
HISTORY_TASKS = [
    ('M001', 'Transportation',  'Ride to ophthalmologist in Winchester',               '2026-04-10 09:00:00', 1.5, 'V008'),
    ('M001', 'Friendly Visit',  'Weekly gardening conversation',                       '2026-04-16 15:00:00', 1.0, 'V002'),
    ('M002', 'Phone Check-In',  'Morning wellness check-in call',                      '2026-04-18 09:00:00', 0.17, 'V010'),
    ('M002', 'Errands',         'Grocery run to Piggly Wiggly',                        '2026-04-15 11:00:00', 2.0, 'V004'),
    ('M004', 'Friendly Visit',  'Read aloud — finished "The Thursday Murder Club"',    '2026-04-14 15:00:00', 1.0, 'V002'),
    ('M004', 'Home Task',       'Replaced front porch light bulbs',                    '2026-04-08 10:00:00', 0.5, 'V009'),
    ('M006', 'Transportation',  'Ride to Franklin for specialist appointment',          '2026-04-11 08:00:00', 4.0, 'V008'),
    ('M007', 'Friendly Visit',  'Afternoon company and prayer',                        '2026-04-17 14:00:00', 1.5, 'V010'),
    ('M009', 'Errands',         'Library book pickup and return',                      '2026-04-16 11:00:00', 1.0, 'V008'),
    ('M010', 'Transportation',  'Ride to dialysis center in Winchester',               '2026-04-19 08:00:00', 3.0, 'V004'),
    ('M012', 'Transportation',  'Physical therapy — first session of the month',       '2026-04-11 10:00:00', 1.5, 'V008'),
    ('M012', 'Home Task',       'Installed grab bar in bathroom',                      '2026-04-08 10:00:00', 1.0, 'V009'),
    ('M013', 'Friendly Visit',  'Welcome visit — tour of the mountain',                '2026-04-18 13:00:00', 1.0, 'V011'),
    ('M014', 'Phone Check-In',  'Daily morning wellness call',                         '2026-04-20 09:00:00', 0.17, 'V008'),
    ('M015', 'Glass Recycling', 'Weekly glass recycling pickup',                       '2026-04-19 09:00:00', 0.5, 'V012'),
]


def seed():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    # ── Schema migrations ──────────────────────────────────────────────────────
    try:
        cur.execute("ALTER TABLE fah_tasks ADD COLUMN IF NOT EXISTS duration_hours FLOAT DEFAULT 1.0")
        cur.execute("ALTER TABLE fah_member_details ADD COLUMN IF NOT EXISTS bio TEXT")
        conn.commit()
    except Exception as e:
        print(f"  schema migration note: {e}")

    # ── Build lookup maps ──────────────────────────────────────────────────────
    cur.execute("SELECT user_id, public_id FROM fah_users")
    id_map = {row['public_id']: row['user_id'] for row in cur.fetchall()}

    # ── Update member dob / city / bio / avatar ────────────────────────────────
    for pid, meta in MEMBER_META.items():
        uid = id_map.get(pid)
        if not uid:
            continue
        cur.execute(
            "UPDATE fah_users SET dob=%s, city=%s WHERE user_id=%s",
            (meta['dob'], meta['city'], uid)
        )
        cur.execute(
            "UPDATE fah_member_details SET bio=%s WHERE member_id=%s",
            (meta['bio'], uid)
        )
    for pid, avatar in MEMBER_AVATARS.items():
        uid = id_map.get(pid)
        if uid:
            cur.execute(
                "UPDATE fah_users SET avatar_file=%s WHERE user_id=%s AND (avatar_file IS NULL OR avatar_file NOT LIKE '/api/%%')",
                (avatar, uid)
            )

    # ── Update volunteer bio / skills / avatar ────────────────────────────────
    for pid, meta in VOLUNTEER_META.items():
        uid = id_map.get(pid)
        if not uid:
            continue
        cur.execute(
            "UPDATE fah_volunteer_details SET bio=%s WHERE volunteer_id=%s",
            (meta['bio'], uid)
        )
        cur.execute(
            "UPDATE fah_users SET avatar_file=%s WHERE user_id=%s AND (avatar_file IS NULL OR avatar_file NOT LIKE '/api/%%')",
            (meta['avatar'], uid)
        )
        for skill in meta['skills']:
            cur.execute(
                "INSERT IGNORE INTO fah_volunteer_skills (volunteer_id, skill) VALUES (%s,%s)",
                (uid, skill)
            )

    # ── Clear existing tasks & requests ───────────────────────────────────────
    cur.execute("DELETE FROM fah_volunteer_requests")
    cur.execute("DELETE FROM fah_tasks")

    # ── Insert open tasks ─────────────────────────────────────────────────────
    open_task_ids = {}
    for (member_pid, category, description, scheduled, duration) in TASKS:
        uid = id_map.get(member_pid)
        if not uid:
            print(f"  skipping open task — member {member_pid} not found")
            continue
        cur.execute("""
            INSERT INTO fah_tasks (member_id, category, description, scheduled_at, duration_hours, status)
            VALUES (%s, %s, %s, %s, %s, 'Open')
        """, (uid, category, description, scheduled, duration))
        open_task_ids[description] = cur.lastrowid

    # ── Insert claimed tasks ──────────────────────────────────────────────────
    for (member_pid, category, description, scheduled, duration, vol_pid) in CLAIMED_TASKS:
        mem_uid = id_map.get(member_pid)
        vol_uid = id_map.get(vol_pid)
        if not mem_uid or not vol_uid:
            print(f"  skipping claimed task — {member_pid}/{vol_pid} not found")
            continue
        cur.execute("""
            INSERT INTO fah_tasks (member_id, category, description, scheduled_at, duration_hours, status)
            VALUES (%s, %s, %s, %s, %s, 'Claimed')
        """, (mem_uid, category, description, scheduled, duration))
        task_id = cur.lastrowid
        cur.execute("""
            INSERT INTO fah_volunteer_requests (task_id, volunteer_id, status)
            VALUES (%s, %s, 'Confirmed')
        """, (task_id, vol_uid))

    # ── Pending volunteer requests on open tasks ───────────────────────────────
    for (desc_substr, vol_pid, created_at) in PENDING_REQUESTS:
        vol_uid = id_map.get(vol_pid)
        if not vol_uid:
            print(f"  skipping pending request — {vol_pid} not found")
            continue
        # Find the task_id by description match
        task_id = None
        for desc, tid in open_task_ids.items():
            if desc_substr in desc:
                task_id = tid
                break
        if not task_id:
            print(f"  skipping pending request — task matching '{desc_substr}' not found")
            continue
        cur.execute("""
            INSERT IGNORE INTO fah_volunteer_requests (task_id, volunteer_id, status, created_at)
            VALUES (%s, %s, 'Pending', %s)
        """, (task_id, vol_uid, created_at))

    # ── Insert completed history tasks ────────────────────────────────────────
    for (member_pid, category, description, scheduled, duration, vol_pid) in HISTORY_TASKS:
        mem_uid = id_map.get(member_pid)
        vol_uid = id_map.get(vol_pid)
        if not mem_uid or not vol_uid:
            continue
        completed_date = scheduled.split(' ')[0]
        cur.execute("""
            INSERT INTO fah_tasks (member_id, category, description, scheduled_at, duration_hours, status, updated_at)
            VALUES (%s, %s, %s, %s, %s, 'Completed', %s)
        """, (mem_uid, category, description, scheduled, duration, f"{completed_date} 12:00:00"))
        task_id = cur.lastrowid
        cur.execute("""
            INSERT INTO fah_volunteer_requests (task_id, volunteer_id, status, created_at)
            VALUES (%s, %s, 'Confirmed', %s)
        """, (task_id, vol_uid, scheduled))

    conn.commit()
    cur.close()
    conn.close()
    print("seed_tasks complete.")


if __name__ == "__main__":
    seed()

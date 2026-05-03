import os
import mysql.connector
from pyid import DB_HOST, DB_USER, DB_PASS, DB_NAME

conn = mysql.connector.connect(
    host=os.environ.get("DB_HOST", DB_HOST),
    port=int(os.environ.get("DB_PORT", 3306)),
    user=DB_USER,
    password=DB_PASS,
    database=DB_NAME,
)
cur = conn.cursor()
for s in open('schema.sql').read().split(';'):
    if s.strip():
        cur.execute(s.strip())
conn.commit()
cur.close()
conn.close()
print('Schema done.')

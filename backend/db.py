import os
import mysql.connector
from mysql.connector import pooling
from pyid import DB_HOST, DB_USER, DB_PASS, DB_NAME

_host = os.environ.get("DB_HOST", DB_HOST)
_port = int(os.environ.get("DB_PORT", 3306))

_pool = pooling.MySQLConnectionPool(
    pool_name="fah_pool",
    pool_size=5,
    host=_host,
    port=_port,
    user=DB_USER,
    password=DB_PASS,
    database=DB_NAME,
    charset="utf8mb4",
    collation="utf8mb4_unicode_ci",
)

def get_conn():
    return _pool.get_connection()

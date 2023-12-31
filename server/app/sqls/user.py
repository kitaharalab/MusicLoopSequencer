from psycopg2.extras import DictCursor

from .connection import get_connection


def add_user(user_id: str, own_id):
    create_sql = "INSERT INTO users (user_id, lancers_id) VALUES (%s, %s)"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(create_sql, (user_id, own_id))
            conn.commit()


def get_user(user_id: str):
    select_sql = "SELECT * FROM users WHERE firebase_id = %s"
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(select_sql, (user_id,))
            result = cur.fetchone()
            return dict(result) if result is not None else None

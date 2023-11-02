from psycopg2.extras import DictCursor

from .connection import get_connection


def add_user(user_id: str, email: str):
    create_sql = "INSERT INTO users (user_id, email) VALUES (%s, %s)"
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(create_sql, (user_id, email))
            conn.commit()

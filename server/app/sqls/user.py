from psycopg2.extras import DictCursor
from psycopg2 import Error

from .connection import get_connection
from .topic import add_topic_preferences, get_topic_preferences


def add_user_by_firebase_id(firebase_id: str) -> int:
    create_sql = "INSERT INTO users (firebase_id) VALUES (%s)"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(create_sql, (firebase_id,))
        conn.commit()


def update_own_id(firebase_id: int, own_id: str):
    update_sql = "UPDATE users SET own_id=%s WHERE firebase_id=%s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(update_sql, (own_id, firebase_id))
        conn.commit()


def get_user(firebase_id: str):
    select_sql = "SELECT * FROM users WHERE firebase_id = %s"
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(select_sql, (firebase_id,))
            result = cur.fetchone()
            return dict(result) if result is not None else None


def register_user(firebase_id: str, user_own_id: str):
    exist_user = get_user(firebase_id) is not None
    if exist_user:
        return False

    try:
        add_user_by_firebase_id(firebase_id)
        update_own_id(firebase_id, user_own_id)
        add_topic_preferences(firebase_id)
    except Error:
        return False

    return True

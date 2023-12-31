from psycopg2.extras import DictCursor

from .connection import get_connection
from .topic import add_topic_preferences, get_topic_preferences


def add_user(user_id: str, own_id: str):
    create_sql = "INSERT INTO users (user_id, own_id) VALUES (%s, %s)"
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


def register_user(user_id: str, user_own_id: str):
    exist_user = get_user(user_id) is not None
    if exist_user:
        return False

    add_user(user_id, user_own_id)

    exist_topic_preferences = get_topic_preferences(user_id) is not None
    if not exist_topic_preferences:
        add_topic_preferences(user_id)

    return True

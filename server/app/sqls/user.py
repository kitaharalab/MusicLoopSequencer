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


def get_user_own_id(firebase_id: str):
    response = None
    select_sql = "SELECT own_id FROM users WHERE firebase_id = %s"
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(select_sql, (firebase_id,))
            result = cur.fetchone()
            response = result["own_id"] if result is not None else None

    return response


def check_user_own_id_null(firebase_id: str) -> bool:
    response = None
    select_sql = "SELECT own_id FROM users WHERE firebase_id = %s AND own_id IS NULL"
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(select_sql, (firebase_id,))
            result = cur.fetchone()
            response = result is not None

    return response


def check_user_own_id(firebase_id: str, user_own_id: str):
    exist_user = get_user(firebase_id) is not None
    if not exist_user:
        return False

    registered_own_id = get_user_own_id(firebase_id)
    if registered_own_id == user_own_id:
        return True

    return False


def register_firebase_id(firebase_id: str):
    exist_user = get_user(firebase_id) is not None
    if exist_user:
        return False

    try:
        add_user_by_firebase_id(firebase_id)
    except Error:
        return False

    return True


def check_sign_in(firebase_id: str, user_own_id: str):
    exist_user = get_user(firebase_id) is not None
    if exist_user:
        return False

    if check_user_own_id_null(firebase_id):
        update_own_id(firebase_id, user_own_id)
        return True

    return check_user_own_id(firebase_id, user_own_id)


def register_user(firebase_id: str, user_own_id: str):
    try:
        register_firebase_id(firebase_id)
        update_own_id(firebase_id, user_own_id)
        exist_topic_preferences = get_topic_preferences(firebase_id) is not None
        if not exist_topic_preferences:
            add_topic_preferences(firebase_id)
    except Error:
        return False

    return True

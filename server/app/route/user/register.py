from flask import current_app
from psycopg2 import Error
from sqls import add_user_by_firebase_id, get_user, update_own_id
from sqls.topic_preferences import init_topic_preferences


def register_firebase_id(firebase_id: str):
    exist_user = get_user(firebase_id) is not None
    if exist_user:
        return False

    try:
        add_user_by_firebase_id(firebase_id)
    except Error:
        return False

    return True


def register_user(firebase_id: str, user_own_id: str):
    try:
        register_firebase_id(firebase_id)
        update_own_id(firebase_id, user_own_id)
        init_topic_preferences(firebase_id)
    except Error as e:
        current_app.logger.warning(f"register_user error. {str(e)}")
        return False

    return True

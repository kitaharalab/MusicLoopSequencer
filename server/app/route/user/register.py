from psycopg2 import Error

from sqls import (
    add_user_by_firebase_id,
    get_user,
    update_own_id,
    get_topic_preferences,
    add_topic_preferences,
)


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
        exist_topic_preferences = get_topic_preferences(firebase_id) is not None
        if not exist_topic_preferences:
            add_topic_preferences(firebase_id)
    except Error:
        return False

    return True

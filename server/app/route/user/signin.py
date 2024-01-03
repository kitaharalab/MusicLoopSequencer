from sqls import (
    get_user,
    update_own_id,
    check_user_own_id_null,
    get_user_own_id,
)


def check_sign_in(firebase_id: str, user_own_id: str):
    exist_user = get_user(firebase_id) is not None
    if not exist_user:
        return False

    if check_user_own_id_null(firebase_id):
        update_own_id(firebase_id, user_own_id)
        return True

    return check_user_own_id(firebase_id, user_own_id)


def check_user_own_id(firebase_id: str, user_own_id: str):
    exist_user = get_user(firebase_id) is not None
    if not exist_user:
        return False

    registered_own_id = get_user_own_id(firebase_id)
    if registered_own_id == user_own_id:
        return True

    return False

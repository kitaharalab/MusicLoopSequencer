from functools import wraps

from firebase_admin import auth
from flask import request
from sqls import add_user, get_user


class AuthError(Exception):
    pass


def get_token_auth_header():
    auth = request.headers.get("Authorization", None)
    if auth is None:
        raise AuthError("Authorization header is expected")
    auth_parts = auth.split()
    if auth_parts[0].lower() != "bearer":
        raise AuthError("Authorization header must start with Bearer")
    elif len(auth_parts) == 1:
        raise AuthError("Token not found")
    elif len(auth_parts) > 2:
        raise AuthError("Authorization header must be bearer token")

    token = auth_parts[1]
    return token


def verify_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise AuthError("Invalid token")


def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            token = get_token_auth_header()
            decoded_token = verify_token(token)
        except AuthError as e:
            return {"message": str(e)}, 401
        except Exception:
            return {"message": "Internal server error"}, 500

        uid = decoded_token.get("uid")
        exist_user = get_user(uid) is not None
        if not exist_user:
            add_user(uid)

        return f(uid, *args, **kwargs)

    return wrapper

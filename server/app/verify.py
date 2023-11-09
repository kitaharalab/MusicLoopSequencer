from flask import request


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

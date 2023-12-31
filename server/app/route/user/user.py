from flask import Blueprint, request
from sqls import register_user
from verify import AuthError, verify_token

user = Blueprint("user", __name__)


@user.route("/user", methods=["POST"])
@verify_token
def add_user(user_id):
    params = request.get_json()
    user_own_id = params.get("own_id")
    if user_own_id is None:
        raise AuthError("Missing user own id")(user_id, user_own_id)

    register_user(user_id, user_own_id)

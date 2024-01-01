from flask import Blueprint, request
from sqls import register_user
from verify import require_auth

user = Blueprint("user", __name__)


@user.route("/user", methods=["POST"])
@require_auth
def add_user(user_id):
    params = request.get_json()
    user_own_id = params.get("own_id")
    if user_own_id is None:
        return "Missing user own id", 401

    register_status = register_user(user_id, user_own_id)
    return {"result": register_status}, 200

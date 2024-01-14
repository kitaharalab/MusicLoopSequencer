from flask import Blueprint, current_app, jsonify, request
from verify import require_auth

from .register import register_user
from .signin import check_sign_in

user = Blueprint("user", __name__)


@user.route("/user/signin", methods=["POST"])
@require_auth
def sign_in(user_id):
    params = request.get_json()
    user_own_id = params.get("own_id")
    if user_own_id is None:
        return (
            jsonify(
                {
                    "status": False,
                }
            ),
            401,
        )

    if check_sign_in(user_id, user_own_id):
        return (
            jsonify(
                {
                    "status": True,
                }
            ),
            200,
        )

    return (
        jsonify(
            {
                "status": False,
            }
        ),
        401,
    )


@user.route("/user", methods=["POST"])
@require_auth
def register(user_id):
    current_app.logger.debug("register")

    params = request.get_json()
    user_own_id = params.get("own_id")
    current_app.logger.debug("user_own_id: %s", user_own_id)

    register_status = register_user(user_id, user_own_id)
    current_app.logger.debug("register_status: %s", register_status)

    if register_status:
        return (
            jsonify(
                {
                    "status": register_status,
                }
            ),
            200,
        )

    return (
        jsonify(
            {
                "status": register_status,
            }
        ),
        401,
    )

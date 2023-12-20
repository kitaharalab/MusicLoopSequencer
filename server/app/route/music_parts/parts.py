from flask import Blueprint, jsonify, make_response
from sqls import get_parts
from cache import cache

parts = Blueprint("parts", __name__)


@parts.route("/parts", methods=["GET"])
@cache.memoize()
def get_infomation_of_parts():
    parts = get_parts()
    return make_response(jsonify(parts))

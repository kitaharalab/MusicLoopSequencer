from flask import Blueprint, jsonify, make_response
from sqls import get_loop_positions_by_part
from cache import cache

sounds = Blueprint("sounds", __name__)


@sounds.route("/parts/<int:partid>/sounds", methods=["GET"])
@cache.memoize()
def get_infomation_of_sounds(partid):
    response = get_loop_positions_by_part(partid)
    return make_response(jsonify(response))

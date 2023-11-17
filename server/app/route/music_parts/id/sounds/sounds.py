from flask import Blueprint, jsonify, make_response
from sqls import get_loop_positions_by_part

sounds = Blueprint("sounds", __name__)


@sounds.route("/", methods=["GET"])
def get_infomation_of_sounds(partid):
    response = get_loop_positions_by_part(partid)
    return make_response(jsonify(response))

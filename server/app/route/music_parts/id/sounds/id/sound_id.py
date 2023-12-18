from flask import Blueprint, jsonify, make_response
from readFiles import readLoopsPath
from sqls import get_part_name

sound_id = Blueprint("sound_id", __name__)


@sound_id.route("/", methods=["GET"])
def get_infomation_sound(partid, soundid):
    part_name = get_part_name(partid)
    x_coordinate, y_coordinate, range_lists = readLoopsPath(part_name)

    degree_of_excitement = 0
    if soundid < int(range_lists[0]):
        degree_of_excitement = 0
    elif soundid < int(range_lists[1]):
        degree_of_excitement = 1
    elif soundid < int(range_lists[2]):
        degree_of_excitement = 2
    elif soundid < int(range_lists[3]):
        degree_of_excitement = 3
    else:
        degree_of_excitement = 4

    sound_feature = [x_coordinate[soundid], y_coordinate[soundid]]

    response = {
        "sound-feature": sound_feature,
        "degree-of-excitement": degree_of_excitement,
    }
    return make_response(jsonify(response))

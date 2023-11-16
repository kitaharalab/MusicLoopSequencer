from flask import Blueprint, jsonify, make_response

part_measure = Blueprint("part_measure", __name__)


# TODO: DBに移行
@part_measure.route(
    "/projects/<projectid>/songs/<songid>/parts/<partid>/measures/<measureid>",
    methods=["GET"],
)
def get_infomation_of_inserted_sound(projectid, songid, partid, measureid):
    sounds_ids = [["null" for i in range(4)] for j in range(32)]
    id_list = []
    path = "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    with open(path) as f:
        id_list = f.read().split("\n")
    if id_list[len(id_list) - 1] == "":
        id_list.pop()
    count = 0

    for i in range(len(id_list)):
        sounds_ids[count][i % 4] = id_list[i]
        if i % 4 == 3:
            count = count + 1
    partid_measureid_sound = ""

    for i in range(32):
        if partid == "0":
            partid_measureid_sound = sounds_ids[int(measureid)][3]
        elif partid == "1":
            partid_measureid_sound = sounds_ids[int(measureid)][2]
        elif partid == "2":
            partid_measureid_sound = sounds_ids[int(measureid)][1]
        else:
            partid_measureid_sound = sounds_ids[int(measureid)][0]

    # response = {"sounds_ids": sounds_ids}
    response = {
        "partid": partid,
        "measureid": measureid,
        "sound": partid_measureid_sound,
    }

    return make_response(jsonify(response))

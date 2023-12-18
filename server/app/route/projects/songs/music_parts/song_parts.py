from flask import Blueprint, jsonify, make_response

song_parts = Blueprint("song_parts", __name__)


# TODO: DBに移行
@song_parts.route(
    "/projects/<projectid>/songs/<songid>/parts/<partid>", methods=["GET"]
)
def get_infomation_of_inserted_sounds_in_selected_part(projectid, songid, partid):
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
    partid_list = ["null" for i in range(32)]

    for i in range(32):
        if partid == "0":
            partid_list[i] = sounds_ids[i][3]
        elif partid == "1":
            partid_list[i] = sounds_ids[i][2]
        elif partid == "2":
            partid_list[i] = sounds_ids[i][1]
        else:
            partid_list[i] = sounds_ids[i][0]

    # response = {"sounds_ids": sounds_ids}
    response = {"partid": partid, "sounds": partid_list}

    return make_response(jsonify(response))

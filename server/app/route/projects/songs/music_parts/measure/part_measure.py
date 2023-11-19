from flask import Blueprint, jsonify, make_response
from sqls import delete_song_details
from verify import require_auth

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


# TODO: デリートの実装
@part_measure.route(
    "/projects/<int:projectid>/songs/<int:songid>/parts/<int:partid>/measures/<int:measureid>",
    methods=["DELETE"],
)
@require_auth
def delete_sound(uid, projectid, songid, partid, measureid):
    #     req = request.args
    #     fix = req.get("fix")
    # if fix -> int(measure/fix_len) ~ int(measure/fix_len) + fix_len to delete

    delete_song_details(songid, partid, measureid + 1)
    return make_response(jsonify({"message": "delete"}))


#     req = request.args
#     fix = req.get("fix")
#     sound_array = load_music_data(
#         "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
#     )

#     drums_list, bass_list, synth_list, sequence_list = get_sound_data()

#     sound_array = delete_music_loop(
#         measureid,
#         partid,
#         sound_array,
#         drums_list,
#         bass_list,
#         synth_list,
#         sequence_list,
#         fix,
#     )
#     # root = tk.Tk()
#     # view = View(master=root)
#     songid = connect_sound(sound_array, projectid, "delete", songid)

#     save_music_data(
#         projectid, songid, sound_array, drums_list, bass_list, synth_list, sequence_list
#     )

#     drums_list, bass_list, synth_list, sequence_list = format_list(sound_array)

#     response = {
#         "songid": int(songid),
#         "parts": [
#             {"partid": 0, "sounds": sequence_list},
#             {"partid": 1, "sounds": synth_list},
#             {"partid": 2, "sounds": bass_list},
#             {"partid": 3, "sounds": drums_list},
#         ],
#     }
#     return make_response(jsonify(response))


# def delete_music_loop(
#     measureid,
#     partid,
#     sound_array,
#     drums_list,
#     bass_list,
#     synth_list,
#     sequence_list,
#     fix,
# ):
#     if fix == 0:
#         sound_array[int(measureid)][3 - int(partid)] = None
#     else:
#         for i in range(4):
#             sound_array[int(int(measureid) / 4) * 4 + i][3 - int(partid)] = None

#     for i in range(len(sound_array)):
#         for j in range(len(sound_array[0])):
#             if j == 0:
#                 for k in range(len(drums_list)):
#                     if sound_array[i][j] == k:
#                         sound_array[i][j] = drums_list[k]
#                     elif sound_array[i][j] == None:
#                         sound_array[i][j] = "null"
#             elif j == 1:
#                 for k in range(len(bass_list)):
#                     if sound_array[i][j] == k:
#                         sound_array[i][j] = bass_list[k]
#                     elif sound_array[i][j] == None:
#                         sound_array[i][j] = "null"
#             elif j == 2:
#                 for k in range(len(synth_list)):
#                     if sound_array[i][j] == k:
#                         sound_array[i][j] = synth_list[k]
#                     elif sound_array[i][j] == None:
#                         sound_array[i][j] = "null"
#             else:
#                 for k in range(len(sequence_list)):
#                     if sound_array[i][j] == k:
#                         sound_array[i][j] = sequence_list[k]
#                     elif sound_array[i][j] == None:
#                         sound_array[i][j] = "null"
#     return sound_array

# def load_music_data(path):
#     data_list = read_file(path)

#     measure_number = 0
#     sound_array = [["null" for i in range(4)] for j in range(32)]

#     for i in range(len(data_list)):
#         if data_list[i] != "null":
#             sound_array[measure_number][i % 4] = int(data_list[i])
#         else:
#             sound_array[measure_number][i % 4] = None
#         if i % 4 == 3:
#             measure_number += 1


# def save_music_data(
#     projectid,
#     songid,
#     sound_array,
#     drums_list,
#     bass_list,
#     synth_list,
#     sequence_list,
#     user_id,
# ):
#     for i in range(len(sound_array)):
#         for j in range(len(sound_array[0])):
#             if j == 0:
#                 for k in range(len(drums_list)):
#                     if sound_array[i][j] == drums_list[k]:
#                         sound_array[i][j] = str(k)
#             elif j == 1:
#                 for k in range(len(bass_list)):
#                     if sound_array[i][j] == bass_list[k]:
#                         sound_array[i][j] = str(k)
#             elif j == 2:
#                 for k in range(len(synth_list)):
#                     if sound_array[i][j] == synth_list[k]:
#                         sound_array[i][j] = str(k)
#             else:
#                 for k in range(len(sequence_list)):
#                     if sound_array[i][j] == sequence_list[k]:
#                         sound_array[i][j] = str(k)

#     add_song(sound_array_wrap(sound_array), songid, user_id)

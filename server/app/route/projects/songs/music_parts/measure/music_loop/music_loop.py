from flask import Blueprint, jsonify, make_response
from sqls import get_parts, get_song_loop_ids, update_song_details
from util.connect_sound import connect_sound
from verify import require_auth

from .rewrite_song import rewrite_music_data

mesure_music_loop = Blueprint("mesure_music_loop", __name__)


# TODO: insert時に曲データのアップデートをする
@mesure_music_loop.route(
    "/projects/<int:projectid>/songs/<int:songid>/parts/<int:partid>/measures/<int:measureid>/musicloops/<int:musicloopid>",
    methods=["POST"],
)
@require_auth
def insert_sound(uid, projectid, songid, partid, measureid, musicloopid):
    parts = get_parts()
    # part_name2index = {"Drums": 0, "Bass": 1, "Synth": 2, "Sequence": 3}
    parts = sorted(parts, key=lambda x: x["id"])
    # data = request.get_json()
    # user_id = data.get("userId", None)

    # TODO: パラメータの取得
    # req = request.args
    # fix = req.get("fix")
    # adapt = req.get("adapt")

    # TODO: fixが1のときは4小節ごとに音素材を入れる
    #         for i in range(4):
    #             sound_array[int(int(measureid) / 4) * 4 + i][3 - int(partid)] = int(
    #                 musicloopid
    #             )
    #
    update_song_details(songid, partid, int(measureid) + 1, musicloopid, uid)
    song_details = get_song_loop_ids(song_id=songid)

    # 0:drums
    # 1:bass
    # 2:synth
    # 3:sequence
    sound_array = [song_details[part["id"]] for part in parts]
    """sound_array[part_id][measure] = loop_id"""
    sound_array = [list(arr) for arr in zip(*sound_array)]
    print(song_details[partid][measureid])
    print(partid, measureid, musicloopid)
    print(sound_array[measureid][partid - 1])

    # TODO: topicのアップデートをここでしてる
    sound_array = rewrite_music_data(measureid, partid, musicloopid, sound_array)
    connect_sound(sound_array, projectid, "insert", songid)

    # TODO:
    #     sound_array = rewrite_music_data(
    #     measureid,
    #     partid,
    #     musicloopid,
    #     sound_array,
    #     drums_list,
    #     bass_list,
    #     synth_list,
    #     sequence_list,
    #     fix,
    #     adapt,
    # )

    response = {"songId": int(songid), "parts": []}
    for part in parts:
        response["parts"].append(
            {
                "partId": part["id"],
                "partName": part["name"],
                "sounds": song_details[part["id"]],
            }
        )

    return make_response(jsonify(response))

from flask import Blueprint, jsonify, make_response, request
from sqls import (
    check_song_loop_log,
    get_parts,
    get_song_loop_ids,
    update_song_details,
    update_wav_data,
    get_loop_id,
    get_loop_id_from_id_chord,
)
from util.connect_sound import connect_sound
from util.const import fix_len, topic_n
from util.topic import update_topic_ratio
from verify import require_auth

mesure_music_loop = Blueprint("mesure_music_loop", __name__)


# TODO: insert時に曲データのアップデートをする
@mesure_music_loop.route(
    "/projects/<int:projectid>/songs/<int:songid>/parts/<int:partid>/measures/<int:measureid>/musicloops/<int:musicloopid>",
    methods=["POST"],
)
@require_auth
def insert_sound(uid, projectid, songid, partid, measureid, musicloopid):
    params = request.get_json()
    if params.get("check", False):
        check_song_loop_log(projectid, songid, partid, measureid + 1, musicloopid, uid)
        return make_response(jsonify({"message": "check song loop log"}))

    measure = measureid + 1
    parts = get_parts()
    # part_name2index = {"Drums": 0, "Bass": 1, "Synth": 2, "Sequence": 3}
    parts = sorted(parts, key=lambda x: x["id"])

    source_loop_id = get_loop_id(songid, partid, measure)
    source_loop_id_chord1 = get_loop_id_from_id_chord(source_loop_id, 1)

    target_loop_id_chord1 = get_loop_id_from_id_chord(musicloopid, 1)

    if source_loop_id_chord1 == target_loop_id_chord1:
        song_details = get_song_loop_ids(song_id=songid)
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

    fix_req = params.get("fix")
    fix = int(fix_req) if fix_req is not None else 0
    adapt_req = params.get("adapt")
    adapt = int(adapt_req) if adapt_req is not None else 0

    update_song_details(
        songid,
        partid,
        measure,
        musicloopid,
        uid,
        fix=fix,
        fix_length=fix_len,
    )
    song_details = get_song_loop_ids(song_id=songid)

    # 0:drums
    # 1:bass
    # 2:synth
    # 3:sequence
    sound_ids_by_part_measure = [song_details[part["id"]] for part in parts]
    """sound_array[part_id][measure] = loop_id"""
    sound_ids_by_measure_part = [list(arr) for arr in zip(*sound_ids_by_part_measure)]

    if adapt == 1:
        update_topic_ratio(partid, musicloopid, uid, topic_n=topic_n)

    _, wav_data = connect_sound(sound_ids_by_measure_part, projectid, "insert", songid)
    update_wav_data(songid, wav_data)

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

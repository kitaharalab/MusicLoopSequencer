
from flask import Blueprint, jsonify, make_response, request
from sqls import (
    check_song_loop_log,
    get_loop_id,
    get_loop_id_from_id_chord,
    get_parts,
    get_song_loop_ids,
    insert_loop_log,
    update_song_details,
    update_wav_data,
)
from util.connect_sound import connect_sound
from util.const import fix_len
from util.give_chord import get_chorded_loop_id
from verify import require_auth

from .update_topic_preferences import update_topic_preferences

mesure_music_loop = Blueprint("mesure_music_loop", __name__)


# TODO: insert時に曲データのアップデートをする
@mesure_music_loop.route(
    "/projects/<int:project_id>/songs/<int:song_id>/parts/<int:part_id>/measures/<int:measure>/musicloops/<int:musicloop_id>",
    methods=["POST"],
)
@require_auth
def insert_sound(uid, project_id, song_id, part_id, measure, musicloop_id):
    params = request.get_json()
    if params.get("check", False):
        check_song_loop_log(project_id, song_id, part_id, measure, musicloop_id, uid)
        return make_response(jsonify({"message": "check song loop log"}))

    parts = get_parts()
    # part_name2index = {"Drums": 0, "Bass": 1, "Synth": 2, "Sequence": 3}
    parts = sorted(parts, key=lambda x: x["id"])

    source_loop_id = get_loop_id(song_id, part_id, measure)

    source_loop_id_chord1 = get_loop_id_from_id_chord(source_loop_id, 1)
    target_loop_id_chord1 = get_loop_id_from_id_chord(musicloop_id, 1)

    if source_loop_id_chord1 == target_loop_id_chord1:
        song_details = get_song_loop_ids(song_id=song_id)
        response = {"songId": int(song_id), "parts": []}
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
    print(f"fix: {fix}, adapt: {adapt}")

    if fix == 0:
        target_loop_id = get_chorded_loop_id(musicloop_id, measure)
        insert_loop_log(
            project_id,
            song_id,
            part_id,
            measure,
            source_loop_id,
            target_loop_id,
            uid,
        )
    else:
        start = (measure - 1) // fix_len * fix_len + 1
        end = start + fix_len
        for m in range(start, end):
            source_loop_id = get_loop_id(song_id, part_id, m)
            target_loop_id = get_chorded_loop_id(musicloop_id, m)
            print(target_loop_id, musicloop_id, m)
            insert_loop_log(
                project_id,
                song_id,
                part_id,
                m,
                source_loop_id,
                target_loop_id,
                uid,
            )

    update_song_details(
        song_id,
        part_id,
        measure,
        musicloop_id,
        uid,
        fix=fix,
        fix_length=fix_len,
    )
    song_details = get_song_loop_ids(song_id=song_id)

    # 0:drums
    # 1:bass
    # 2:synth
    # 3:sequence
    sound_ids_by_part_measure = [song_details[part["id"]] for part in parts]
    """sound_array[part_id][measure] = loop_id"""
    sound_ids_by_measure_part = [list(arr) for arr in zip(*sound_ids_by_part_measure)]

    if adapt == 1:
        update_topic_preferences(uid, musicloop_id)
    _, wav_data = connect_sound(
        sound_ids_by_measure_part, project_id, "insert", song_id
    )
    update_wav_data(song_id, wav_data)

    response = {"songId": int(song_id), "parts": []}
    for part in parts:
        response["parts"].append(
            {
                "partId": part["id"],
                "partName": part["name"],
                "sounds": song_details[part["id"]],
            }
        )

    return make_response(jsonify(response))

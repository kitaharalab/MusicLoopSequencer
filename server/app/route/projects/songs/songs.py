import io
import os

from flask import Blueprint, jsonify, make_response, request, send_file
from psycopg2.extras import DictCursor
from sqls import add_excitement_curve
from sqls import create_song as add_song
from sqls import (
    get_connection,
    get_excitement_curve,
    get_parts,
    get_song_details,
    get_song_evaluation,
    get_song_loop_ids,
    get_wav_data_from_song_id,
    loop_mute_log,
    loop_unmute_log,
    pause_song_log,
    play_song_log,
    rest_log,
    sound_array_wrap,
    stop_song_log,
    update_song_evaluation,
)
from verify import require_auth

from .create_music import createMusic
from .section import music_section_info_from_section_array
from .util import format_list, name_to_id

songs = Blueprint("songs", __name__)


@songs.route("/projects/<int:projectid>/songs", methods=["POST"])
@require_auth
def create_song(uid, projectid):
    print("get data")
    data = request.get_json()  # WebページからのJSONデータを受け取る．
    curves = data["curves"]

    fix_req = data.get("fix")
    fix = int(fix_req) if fix_req is not None else 0
    structure_req = data.get("structure")
    structure = int(structure_req) if structure_req is not None else 0

    array, songid, section_array, wav_data_bytes = createMusic(
        curves, projectid, uid, structure=structure, fix=fix
    )

    array = name_to_id(array)

    song_id = add_song(sound_array_wrap(array), projectid, uid, wav_data_bytes)

    raw_curve = data["rawCurve"]
    curve_max = data["curveMax"]
    add_excitement_curve(song_id, raw_curve, curve_max)

    parts = get_parts()

    drums_list, bass_list, synth_list, sequence_list = format_list(array)
    song_list = {
        "Drums": drums_list,
        "Bass": bass_list,
        "Synth": synth_list,
        "Sequence": sequence_list,
    }

    section = music_section_info_from_section_array(section_array)
    response = {"songId": song_id, "parts": [], "section": section}

    for part in parts:
        id = part["id"]
        name = part["name"]
        response["parts"].append({"id": id, "sounds": song_list[name]})

    return make_response(jsonify(response))


@songs.route("/projects/<projectid>/songs", methods=["GET"])
def get_infomation_songs(projectid):
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                "SELECT id FROM songs WHERE project_id = %s ORDER BY id",
                (int(projectid),),
            )
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return make_response(jsonify(response))


# TODO: 誤字の修正
@songs.route("/projects/<int:projectid>/songs/<int:songid>", methods=["GET"])
def get_infomation_song(projectid, songid):
    part_name2index = {"Drums": 0, "Bass": 1, "Synth": 2, "Sequence": 3}
    parts = get_parts()
    parts = sorted(parts, key=lambda x: part_name2index[x["name"]])

    loop_ids_by_part = get_song_loop_ids(songid)
    excitement_curve = get_excitement_curve(songid)
    evaluation = get_song_evaluation(songid)

    response = {
        "parts": [],
        "excitement_curve": excitement_curve,
        "evaluation": evaluation,
    }
    for part in parts:
        response["parts"].append(
            {
                "partId": part["id"],
                "partNmae": part["name"],
                "sounds": loop_ids_by_part[part["id"]],
            }
        )

    return make_response(jsonify(response))


@songs.route("/projects/<int:projectid>/songs/<int:songid>", methods=["POST"])
@require_auth
def log(uid, projectid, songid):
    params = request.get_json()
    is_mute = params.get("mute", None)
    evaluation = params.get("evaluation", None)
    rest = params.get("rest", None)

    if rest is not None:
        rest_log(projectid, songid, uid, rest)
        return make_response(jsonify({"message": "rest log"}))

    if evaluation is not None:
        update_song_evaluation(songid, evaluation)
        return make_response(jsonify({"message": "update evaluation"}))

    if is_mute is None:
        return make_response(jsonify({"message": "do nothing"})), 204

    if is_mute:
        loop_mute_log(projectid, songid, uid)
        return make_response(jsonify({"message": "muteloop log"}))
    else:
        loop_unmute_log(projectid, songid, uid)
        return make_response(jsonify({"message": "unmute loop log"}))


@songs.route("/projects/<projectid>/songs/<songid>/wav/", methods=["GET"])
def download_song(projectid, songid):
    data = get_wav_data_from_song_id(songid)

    if data is None:
        return make_response(jsonify({"message": "指定された楽曲ファイルは存在しません"})), 204

    response = send_file(
        io.BytesIO(data),
        mimetype="audio/wav",
        as_attachment=True,
        download_name=f"song_{songid}.wav",
    )

    return response


# TODO: DBに移行
@songs.route("/projects/<projectid>/songs/<songid>/wav", methods=["POST"])
@require_auth
def log_play_song(uid, projectid, songid):
    song_data = get_song_details(songid)
    exsist_song = song_data is not None

    if not exsist_song:
        return make_response(jsonify({"message": "指定された楽曲ファイルは存在しません"})), 204

    params = request.get_json()
    response = make_response(jsonify({"message": "操作がログに書き込まれました"}))

    if params.get("pause", False):
        pause_song_log(projectid, songid, uid)
        return response

    if params.get("stop", False):
        stop_song_log(projectid, songid, uid)
        return response

    play_song_log(projectid, songid, uid)
    return response

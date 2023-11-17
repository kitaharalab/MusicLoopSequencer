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
    get_song_loop_ids,
    get_wav_data_from_song_id,
    play_song_log,
    sound_array_wrap,
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

    # req = request.args
    # fix = req.get("fix")
    # structure = req.get("structure")

    array, songid, section_array, wav_data_bytes = createMusic(curves, projectid, uid)
    # array, songid, section_array = createMusic(curves, projectid, fix, structure)

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

    response = {"parts": [], "excitement_curve": excitement_curve}
    for part in parts:
        response["parts"].append(
            {
                "partId": part["id"],
                "partNmae": part["name"],
                "sounds": loop_ids_by_part[part["id"]],
            }
        )

    return make_response(jsonify(response))


@songs.route("/projects/<projectid>/songs/<songid>/wav", methods=["GET"])
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
    response.headers["access-control-allow-origin"] = request.headers.get("origin")

    return response


# TODO: DBに移行
@songs.route("/projects/<projectid>/songs/<songid>/wav", methods=["POST"])
@require_auth
def log_play_song(uid, projectid, songid):
    file_name = f"./project/{projectid}/songs/{songid}/song{songid}.wav"
    exist_file = os.path.isfile(file_name)
    # data = request.get_json()
    # user_id = data.get("userId", None)

    if not exist_file:
        return make_response(jsonify({"message": "指定された楽曲ファイルは存在しません"})), 204

    play_song_log(projectid, songid, uid)
    return make_response(jsonify({"message": "操作がログに書き込まれました"})), 200

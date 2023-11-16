from flask import Blueprint, jsonify, make_response, request
from sqls import add_excitement_curve
from sqls import create_song as add_song
from sqls import get_parts, sound_array_wrap
from verify import require_auth

from .create_music import createMusic
from .section import music_section_info_from_section_array
from .util import format_list, name_to_id

songs = Blueprint("songs", __name__)


@songs.route("/projects/<int:projectid>/songs", methods=["POST"])
@require_auth
def create_song(uid, projectid):
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

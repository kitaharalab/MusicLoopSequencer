import io

from flask import Blueprint, jsonify, make_response, request, send_file
from sqls import get_loop_music_by_id, get_loop_topic_by_id, play_loop_log
from verify import require_auth

music_loop = Blueprint("music_loop", __name__)


@music_loop.route("/parts/<int:partid>/musicloops/<musicloopid>/wav", methods=["GET"])
def download_musicloop(partid, musicloopid):
    data = get_loop_music_by_id(musicloopid)

    if data is None:
        return make_response(jsonify({"message": "指定された楽曲ファイルは存在しません"})), 204

    return send_file(io.BytesIO(data), mimetype="audio/wav")


@music_loop.route("/parts/<int:partid>/musicloops/<musicloopid>/wav", methods=["POST"])
@require_auth
def log_loop_play(uid, partid, musicloopid):
    data = request.get_json()
    play_loop_log(data["projectId"], data["songId"], partid, musicloopid, uid)

    return make_response(jsonify({"message": "操作がログに書き込まれました"})), 200


@music_loop.route(
    "/parts/<int:partid>/musicloops/<int:musicloopid>/topic", methods=["GET"]
)
def get_topic_ratio(partid: int, musicloopid: int):
    loop_topic = get_loop_topic_by_id(musicloopid)
    return make_response(jsonify(loop_topic))

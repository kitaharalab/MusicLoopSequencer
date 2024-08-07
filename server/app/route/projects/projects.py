import json

from flask import Blueprint, jsonify, make_response, request
from sqls import (
    add_project,
    create_project_log,
    get_project,
    get_project_song_ids,
    get_projects,
    open_project_log,
    active_log,
)
from verify import require_auth

projects = Blueprint("projects", __name__)


@projects.route("/projects", methods=["POST"])
@require_auth
def create_project(uid):
    # TODO: パラメータの取り方．
    param = request.get_json()
    open_project = param.get("open", False)
    if open_project:
        open_project_log(param["id"], uid)
        return make_response(jsonify({"message": "open project"}))

    title = param.get("title", None)
    title = title if title is not None else "Untitled"
    new_project_id = add_project(title, uid)
    create_project_log(new_project_id["id"], uid)

    return make_response(jsonify(new_project_id))


def open_project(project_id: int, user_id: str):
    open_project_log(project_id, user_id)


# TODO: ユーザーの認証でそのユーザーのプロジェクトだけ取る
@projects.route("/projects", methods=["GET"])
@require_auth
def get_information_of_projects(user_id):
    response = get_projects(user_id)

    return make_response(jsonify(response))


@projects.route("/projects/<int:projectid>", methods=["GET"])
def get_infomation_of_project(projectid):
    project_info = get_project(projectid)
    song_ids = get_project_song_ids(projectid)
    response = {"song_ids": song_ids, "project": project_info}
    return make_response(jsonify(response))


@projects.route("/projects/<int:project_id>/log/active", methods=["POST"])
@require_auth
def logs(uid, project_id):
    data = request.get_json()
    active = data.get("active", None)
    if active is not None:
        active_log(uid, project_id, active)
        return make_response(jsonify({"message": f"logging active: {active}"}))

    return make_response(jsonify({"message": "failed logging active"})), 400

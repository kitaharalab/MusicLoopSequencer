import json

from flask import Blueprint, jsonify, make_response, request
from flask_cors import CORS
from sqls import add_project, get_projects
from verify import require_auth

projects = Blueprint("projects", __name__)


@projects.route("/projects", methods=["POST"])
@require_auth
def create_project(uid):
    # TODO: パラメータの取り方．request.get_json()
    req_data = None if request.data == b"" else request.data.decode("utf-8")

    data_json = json.loads(req_data) if req_data is not None else {}
    title = data_json.get("title", None)
    title = title if title is not None else "Untitled"
    new_project_id = add_project(title, uid)

    return make_response(jsonify(new_project_id))


# TODO: ユーザーの認証でそのユーザーのプロジェクトだけ取る
@projects.route("/projects", methods=["GET"])
def get_infomation_of_projects():
    isExperimentParam = request.args.get("experiment")
    isExperiment = (
        json.loads(isExperimentParam) if isExperimentParam is not None else False
    )

    response = get_projects(isExperiment)

    return make_response(jsonify(response))

import json
import os
import random
import re

import firebase_admin
import numpy as np
import pandas as pd
from firebase_admin import credentials
from flask import Flask, jsonify, make_response, request, send_file
from flask_cors import CORS
from hmmlearn import hmm
from psycopg2.extras import DictCursor
from pydub import AudioSegment
from readFiles import readLoopsPath, readPartCoordinates
from sqls import add_excitement_curve, add_project
from sqls import create_song as add_song
from sqls import (
    get_connection,
    get_excitement_curve,
    get_loop_music_by_id,
    get_loop_positions_by_part,
    get_part_name,
    get_parts,
    get_project,
    get_project_song_ids,
    get_projects,
    get_song_loop_ids,
    play_loop_log,
    play_song_log,
    sound_array_wrap,
    update_song_details,
)
from verify import require_auth

fix_len = 4
topic_n = 4
excitement_len = 32
selected_constitution_determine = 1
selected_fix_determine = 0

PARTS = ["Drums", "Bass", "Synth", "Sequence"]


cred = credentials.Certificate("./credentials.json")
firebase_app = firebase_admin.initialize_app(cred)

app = Flask(__name__)
CORS(app)


@app.route("/parts", methods=["GET"])
def get_infomation_of_parts():
    parts = get_parts()
    return make_response(jsonify(parts))


@app.route("/parts/<int:partid>/sounds", methods=["GET"])
def get_infomation_of_sounds(partid):
    response = get_loop_positions_by_part(partid)
    return make_response(jsonify(response))


@app.route("/parts/<int:partid>/sounds/<int:soundid>", methods=["GET"])
def get_infomation_sound(partid, soundid):
    part_name = get_part_name(partid)
    x_coordinate, y_coordinate, range_lists = readLoopsPath(part_name)

    degree_of_excitement = 0
    if soundid < int(range_lists[0]):
        degree_of_excitement = 0
    elif soundid < int(range_lists[1]):
        degree_of_excitement = 1
    elif soundid < int(range_lists[2]):
        degree_of_excitement = 2
    elif soundid < int(range_lists[3]):
        degree_of_excitement = 3
    else:
        degree_of_excitement = 4

    sound_feature = [x_coordinate[soundid], y_coordinate[soundid]]

    response = {
        "sound-feature": sound_feature,
        "degree-of-excitement": degree_of_excitement,
    }
    return make_response(jsonify(response))


@app.route("/projects", methods=["POST"])
@require_auth
def create_project(uid):
    req_data = None if request.data == b"" else request.data.decode("utf-8")

    data_json = json.loads(req_data) if req_data is not None else {}
    title = data_json.get("title", None)
    title = title if title is not None else "Untitled"
    new_project_id = add_project(title, uid)

    return make_response(jsonify(new_project_id))


@app.route("/projects", methods=["GET"])
def get_infomation_of_projects():
    isExperimentParam = request.args.get("experiment")
    isExperiment = (
        json.loads(isExperimentParam) if isExperimentParam is not None else False
    )

    response = get_projects(isExperiment)

    return make_response(jsonify(response))


# TODO: 楽曲のIDごとに盛り上がり度曲線を記録している
@app.route("/projects/<int:projectid>", methods=["GET"])
def get_infomation_of_project(projectid):
    project_info = get_project(projectid)
    song_ids = get_project_song_ids(projectid)
    response = {"song_ids": song_ids, "project": project_info}

    # curves = get_excitement_curve()
    # curves = []
    # with open(f"./project/{projectid}/curve/curve.txt") as f:
    #     curves = f.read().split("\n")
    # if curves[len(curves) - 1] == "":
    #     curves.pop()
    # for i in range(len(curves)):
    #     curves[i] = int(curves[i])
    # response = {""number-of-sound": len(song_ids), "curves": curves"}

    return make_response(jsonify(response))


@app.route("/projects/<int:projectid>/songs", methods=["POST"])
@require_auth
def create_song(uid, projectid):
    data = request.get_json()  # WebページからのJSONデータを受け取る．
    curves = data["curves"]
    array, songid, section_array = createMusic(curves, projectid)

    array = name_to_id(array)

    song_id = add_song(sound_array_wrap(array), projectid, uid)

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

    response = create_response(
        section_array, song_id, drums_list, bass_list, synth_list, sequence_list
    )
    response = {"songId": song_id, "parts": [], "section": response.get("section", [])}

    for part in parts:
        id = part["id"]
        name = part["name"]
        response["parts"].append({"id": id, "sounds": song_list[name]})

    return make_response(jsonify(response))


def create_response(
    section_array, songid, drums_list, bass_list, synth_list, sequence_list
):
    response = None
    if section_array == "":
        response = {
            "songid": int(songid),
            "parts": [
                {"partid": 0, "sounds": sequence_list},
                {"partid": 1, "sounds": synth_list},
                {"partid": 2, "sounds": bass_list},
                {"partid": 3, "sounds": drums_list},
            ],
        }
    else:
        response = {
            "songid": int(songid),
            "parts": [
                {"partid": 0, "sounds": sequence_list},
                {"partid": 1, "sounds": synth_list},
                {"partid": 2, "sounds": bass_list},
                {"partid": 3, "sounds": drums_list},
            ],
            "section": [],
        }
    id, start, end = 0, 0, 0
    section_name = ["intro", "breakdown", "buildup", "drop", "outro"]
    for i in range(len(section_array)):
        if id != section_array[i]:
            end = i - 1
            section = {
                "start": start,
                "end": end,
                "section_name": section_name[section_array[i - 1]],
            }
            response["section"].append(section)
            start = i
            id = section_array[i]
        if i == len(section_array) - 1:
            end = len(section_array) - 1
            section = {
                "start": start,
                "end": end,
                "section_name": section_name[section_array[i]],
            }
            response["section"].append(section)

    return response


def name_to_id(array):
    part_list = [readLoopsPath(part) for part in PARTS]
    for i in range(len(array)):
        for j in range(len(array[0])):
            for k in range(len(part_list[j])):
                if array[i][j] == part_list[j][k]:
                    array[i][j] = str(k)

    return array


def format_list(array):
    drums_list, bass_list, synth_list, sequence_list = (
        ["null" for i in range(32)],
        ["null" for i in range(32)],
        ["null" for i in range(32)],
        ["null" for i in range(32)],
    )

    for i in range(32):
        if array[i][0] == "null" or array[i][0] is None:
            drums_list[i] = None
        else:
            drums_list[i] = int(array[i][0])
        if array[i][1] == "null" or array[i][1] is None:
            bass_list[i] = None
        else:
            bass_list[i] = int(array[i][1])
        if array[i][2] == "null" or array[i][2] is None:
            synth_list[i] = None
        else:
            synth_list[i] = int(array[i][2])
        if array[i][3] == "null" or array[i][3] is None:
            sequence_list[i] = None
        else:
            sequence_list[i] = int(array[i][3])

    return drums_list, bass_list, synth_list, sequence_list


@app.route("/projects/<projectid>/songs", methods=["GET"])
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


@app.route("/projects/<int:projectid>/songs/<int:songid>", methods=["GET"])
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


@app.route("/projects/<projectid>/songs/<songid>/parts/<partid>", methods=["GET"])
def get_infomation_of_inserted_sounds_in_selected_part(projectid, songid, partid):
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
    partid_list = ["null" for i in range(32)]

    for i in range(32):
        if partid == "0":
            partid_list[i] = sounds_ids[i][3]
        elif partid == "1":
            partid_list[i] = sounds_ids[i][2]
        elif partid == "2":
            partid_list[i] = sounds_ids[i][1]
        else:
            partid_list[i] = sounds_ids[i][0]

    # response = {"sounds_ids": sounds_ids}
    response = {"partid": partid, "sounds": partid_list}

    return make_response(jsonify(response))


@app.route(
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


@app.route(
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

    sound_array = rewrite_music_data(measureid, partid, musicloopid, sound_array)
    connect_sound(sound_array, projectid, "insert", songid)

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


def read_file(path):
    data_list = []
    with open(path) as f:
        data_list = f.read().split("\n")

    return data_list


def load_music_data(path):
    data_list = read_file(path)

    measure_number = 0
    sound_array = [["null" for i in range(4)] for j in range(32)]

    for i in range(len(data_list)):
        if data_list[i] != "null":
            sound_array[measure_number][i % 4] = int(data_list[i])
        else:
            sound_array[measure_number][i % 4] = None
        if i % 4 == 3:
            measure_number += 1


def get_music_data(data):
    sequence_list = data["sequenceList"]
    synth_list = data["synthList"]
    bass_list = data["bassList"]
    drums_list = data["drumsList"]

    sound_array = [["null" for i in range(4)] for j in range(32)]

    for i in range(len(sound_array)):
        for j in range(len(sound_array[0])):
            if j == 0:
                sound_array[i][j] = drums_list[i]
            elif j == 1:
                sound_array[i][j] = bass_list[i]
            elif j == 2:
                sound_array[i][j] = synth_list[i]
            else:
                sound_array[i][j] = sequence_list[i]
    return sound_array


def get_sound_data():
    drums_list = []
    bass_list = []
    synth_list = []
    sequence_list = []
    with open("./text/drums_word_list.txt") as f:
        drums_list = f.read().split("\n")
    with open("./text/bass_word_list.txt") as f:
        bass_list = f.read().split("\n")
    with open("./text/synth_word_list.txt") as f:
        synth_list = f.read().split("\n")
    with open("./text/sequence_word_list.txt") as f:
        sequence_list = f.read().split("\n")
    return drums_list, bass_list, synth_list, sequence_list


def rewrite_music_data(
    measureid,
    partid,
    musicloopid,
    sound_array,
):
    # 各音素材へのパス
    drums_list, bass_list, synth_list, sequence_list = get_sound_data()

    for i in range(len(sound_array)):
        for j in range(len(sound_array[0])):
            if j == 0:
                for k in range(len(drums_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = drums_list[k]
                    elif sound_array[i][j] is None:
                        sound_array[i][j] = "null"
            elif j == 1:
                for k in range(len(bass_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = bass_list[k]
                    elif sound_array[i][j] is None:
                        sound_array[i][j] = "null"
            elif j == 2:
                for k in range(len(synth_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = synth_list[k]
                    elif sound_array[i][j] is None:
                        sound_array[i][j] = "null"
            else:
                for k in range(len(sequence_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = sequence_list[k]
                    elif sound_array[i][j] is None:
                        sound_array[i][j] = "null"
    update_topic_ratio(sound_array, measureid, partid)
    return sound_array


def update_topic_ratio(sound_array, measureid, partid):
    # print("ここまでは大丈夫")
    # TODO: partidをむりやり変更，現在のIDから1を引けば同じになるという前提．measureIDも同様
    split_name = re.split("/|\.", str(sound_array[int(measureid)][int(partid) - 1]))
    # part_list = ["Drums", "Bass", "Synth", "Sequence"]
    pass_ratio_topic = f"./lda/{split_name[3]}/ratio_topic{split_name[4]}.txt"
    ratio_topic = read_file(pass_ratio_topic)

    for i in range(len(ratio_topic)):
        ratio_topic[i] = float(ratio_topic[i])
    df = pd.read_csv(
        "./lda/" + split_name[3] + "/lda" + split_name[4] + ".csv",
        header=0,
        index_col=0,
    )
    feature_names = df.index.values
    n = 0

    for i in range(len(feature_names)):
        if feature_names[i] == split_name[5]:
            n = i
    topic_array = np.array(df[n : n + 1])[0][0:]
    for i in range(topic_n):
        ratio_topic[i] += topic_array[i]

    with open(pass_ratio_topic, mode="w") as f:
        for k in range(4):
            # print(k)
            if k == 0:
                f.write(str(ratio_topic[k]))
            else:
                f.write("\n" + str(ratio_topic[k]))


@app.route(
    "/projects/<projectid>/songs/<songid>/parts/<partid>/measures/<measureid>",
    methods=["DELETE"],
)
@require_auth
def delete_sound(uid, projectid, songid, partid, measureid):
    # data = request.get_json()      #WebページからのJSONデータを受け取る．
    # sound_array = get_music_data(data)
    sound_array = load_music_data(
        "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    )

    drums_list, bass_list, synth_list, sequence_list = get_sound_data()

    sound_array = delete_music_loop(
        measureid, partid, sound_array, drums_list, bass_list, synth_list, sequence_list
    )
    # root = tk.Tk()
    # view = View(master=root)
    songid = connect_sound(sound_array, projectid, "delete", songid)

    # save_music_data(
    #     projectid, songid, sound_array, drums_list, bass_list, synth_list, sequence_list, user_id
    # )

    drums_list, bass_list, synth_list, sequence_list = format_list(sound_array)

    response = {
        "songid": int(songid),
        "parts": [
            {"partid": 0, "sounds": sequence_list},
            {"partid": 1, "sounds": synth_list},
            {"partid": 2, "sounds": bass_list},
            {"partid": 3, "sounds": drums_list},
        ],
    }
    return make_response(jsonify(response))


def delete_music_loop(
    measureid, partid, sound_array, drums_list, bass_list, synth_list, sequence_list
):
    if int(partid) == 0:
        sound_array[int(measureid)][3 - int(partid)] = None
    elif int(partid) == 1:
        sound_array[int(measureid)][3 - int(partid)] = None
    elif int(partid) == 2:
        sound_array[int(measureid)][3 - int(partid)] = None
    else:
        sound_array[int(measureid)][3 - int(partid)] = None

    for i in range(len(sound_array)):
        for j in range(len(sound_array[0])):
            if j == 0:
                for k in range(len(drums_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = drums_list[k]
                    elif sound_array[i][j] is None:
                        sound_array[i][j] = "null"
            elif j == 1:
                for k in range(len(bass_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = bass_list[k]
                    elif sound_array[i][j] is None:
                        sound_array[i][j] = "null"
            elif j == 2:
                for k in range(len(synth_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = synth_list[k]
                    elif sound_array[i][j] is None:
                        sound_array[i][j] = "null"
            else:
                for k in range(len(sequence_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = sequence_list[k]
                    elif sound_array[i][j] is None:
                        sound_array[i][j] = "null"

    return sound_array


def save_music_data(
    projectid,
    songid,
    sound_array,
    drums_list,
    bass_list,
    synth_list,
    sequence_list,
    user_id,
):
    for i in range(len(sound_array)):
        for j in range(len(sound_array[0])):
            if j == 0:
                for k in range(len(drums_list)):
                    if sound_array[i][j] == drums_list[k]:
                        sound_array[i][j] = str(k)
            elif j == 1:
                for k in range(len(bass_list)):
                    if sound_array[i][j] == bass_list[k]:
                        sound_array[i][j] = str(k)
            elif j == 2:
                for k in range(len(synth_list)):
                    if sound_array[i][j] == synth_list[k]:
                        sound_array[i][j] = str(k)
            else:
                for k in range(len(sequence_list)):
                    if sound_array[i][j] == sequence_list[k]:
                        sound_array[i][j] = str(k)

    add_song(sound_array_wrap(sound_array), songid, user_id)


"""@app.route("/projects/<projectid>/songs/<songid>/<filename>", methods=['GET'])
def downloadSong(projectid,songid,filename):
    filepath = "./project/" + projectid + "/songs/" + songid + "/" + filename
    response = make_response(filepath)
    response.headers['Content-Type'] = 'audio/wav'
    response.headers['Content-Disposition'] = 'attachment; filename=' + filename
    return response"""


@app.route("/projects/<projectid>/songs/<songid>/wav", methods=["GET"])
def download_song(projectid, songid):
    file_name = f"./project/{projectid}/songs/{songid}/song{songid}.wav"
    exist_file = os.path.isfile(file_name)

    if not exist_file:
        return make_response(jsonify({"message": "指定された楽曲ファイルは存在しません"})), 204

    return send_file(file_name, as_attachment=True)


@app.route("/projects/<projectid>/songs/<songid>/wav", methods=["POST"])
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


@app.route("/parts/<int:partid>/musicloops/<musicloopid>/wav", methods=["GET"])
def download_musicloop(partid, musicloopid):
    data = get_loop_music_by_id(musicloopid)
    response = make_response(data)
    response.headers.set("Content-Type", request.content_type)

    return response


@app.route("/parts/<int:partid>/musicloops/<musicloopid>/wav", methods=["POST"])
@require_auth
def log_loop_play(uid, partid, musicloopid):
    data = request.get_json()
    play_loop_log(data["projectId"], data["songId"], partid, musicloopid, uid)

    return make_response(jsonify({"message": "操作がログに書き込まれました"})), 200


@app.route("/parts/<partid>/musicloops/<musicloopid>/topic", methods=["GET"])
def get_topic_ratio(partid, musicloopid):
    part = "null"
    if partid == "0":
        part = "sequence"
    elif partid == "1":
        part = "synth"
    elif partid == "2":
        part = "bass"
    else:
        part = "drums"

    musicLoop_list = read_file("./text/" + part + "_word_list.txt")
    """bass_word_list.txt"""
    if musicLoop_list[len(musicLoop_list) - 1] == "":
        musicLoop_list.pop()
    musicLoopName = "null"
    for i in range(len(musicLoop_list)):
        if i == int(musicloopid):
            musicLoopName = musicLoop_list[i]
    split_name = re.split("/|\.", musicLoopName)
    # print(split_name)
    # print(split_name[3], split_name[4], split_name[5])
    df = pd.read_csv(
        "./lda/" + split_name[3] + "/lda" + split_name[4] + ".csv",
        header=0,
        index_col=0,
    )
    feature_names = df.index.values
    n = 0
    # print(split_name[3], split_name[4], split_name[5])
    for i in range(len(feature_names)):
        if feature_names[i] == split_name[5]:
            n = i
    topic_array = np.array(df[n : n + 1])[0][0:]

    return send_file(
        "./TechnoTrance/"
        + split_name[3]
        + "/"
        + split_name[4]
        + "/"
        + split_name[5]
        + ".wav",
        as_attachment=True,
    )


@app.route("/topic", methods=["GET"])
def get_topic_preference():
    ratio_topic = load_topic_preference()
    response = {"ratio-topic": ratio_topic}

    return make_response(jsonify(response))


def load_topic_preference():
    ratio_topic = [[[1.0 for i in range(topic_n)] for j in range(5)] for k in range(4)]
    part_list = ["Drums", "Bass", "Synth", "Sequence"]
    for i in range(4):
        for j in range(5):
            pass_ratio_topic = (
                "./lda/" + part_list[i] + "/ratio_topic" + str(j) + ".txt"
            )
            topic = []
            with open(pass_ratio_topic) as f:
                topic = f.read().split("\n")
            for k in range(4):
                ratio_topic[i][j][k] = float(topic[k])

    return ratio_topic


def createMusic(array, projectid):
    """楽曲の生成"""
    # 盛り上がり度を求める
    # self.excitement_array = self.model.chengeExcitement(array)
    # 状態を求める
    (
        no_part_hmm_model,
        intro_hmm_model,
        breakdown_hmm_model,
        buildup_hmm_model,
        drop_hmm_model,
        outro_hmm_model,
    ) = initialize_Hmm()
    hmm_array = ""
    section_array = ""
    if selected_constitution_determine == 0:
        hmm_array = use_HMM(array, no_part_hmm_model)
    else:
        hmm_array, section_array = use_Auto_HMM(
            array,
            intro_hmm_model,
            breakdown_hmm_model,
            buildup_hmm_model,
            drop_hmm_model,
            outro_hmm_model,
        )
    if selected_fix_determine == 1:
        if selected_constitution_determine == 0:
            hmm_array, array = fix_Hmm(hmm_array, array)
        else:
            section_array = dtw(array)
            hmm_array, array = fix_Auto_Hmm(hmm_array, array, section_array)
    # 音素材を繋げる
    sound_list = choose_sound(array, hmm_array)
    # コードを付与する
    sound_list = give_chord(sound_list)
    # 音素材を繋げる
    songid = connect_sound(sound_list, projectid, "create", None)

    return sound_list, songid, section_array


def use_HMM(excitement_array, no_part_hmm_model):
    """HMMを使用する"""
    observation_data = np.atleast_2d(excitement_array).T
    hmm_array, hmm_array = no_part_hmm_model.decode(observation_data)
    return hmm_array


def use_Auto_HMM(
    excitement_array,
    intro_hmm_model,
    breakdown_hmm_model,
    buildup_hmm_model,
    drop_hmm_model,
    outro_hmm_model,
):
    """構成を考慮したHMMを使用する"""
    section_array = dtw(excitement_array)
    # パート毎にリストを用意する
    intro_array, breakdown_array, buildup_array, drop_array, outro_array = (
        list(),
        list(),
        list(),
        list(),
        list(),
    )

    for i, e in enumerate(excitement_array):
        if section_array[i] == 0:
            intro_array.append(e)
        elif section_array[i] == 1:
            breakdown_array.append(e)
        elif section_array[i] == 2:
            buildup_array.append(e)
        elif section_array[i] == 3:
            drop_array.append(e)
        elif section_array[i] == 4:
            outro_array.append(e)

    # intro
    intro_data = np.atleast_2d(intro_array).T
    intro_hmm_array, intro_hmm_array = intro_hmm_model.decode(intro_data)
    # breakdown
    breakdown_data = np.atleast_2d(breakdown_array).T
    breakdown_hmm_array, breakdown_hmm_array = breakdown_hmm_model.decode(
        breakdown_data
    )
    # buildup
    buildup_data = np.atleast_2d(buildup_array).T
    buildup_hmm_array, buildup_hmm_array = buildup_hmm_model.decode(buildup_data)
    # drop
    drop_data = np.atleast_2d(drop_array).T
    drop_hmm_array, drop_hmm_array = drop_hmm_model.decode(drop_data)
    # outro
    outro_data = np.atleast_2d(outro_array).T
    outro_hmm_array, outro_hmm_array = outro_hmm_model.decode(outro_data)

    temp = np.concatenate(
        [
            intro_hmm_array,
            breakdown_hmm_array,
            buildup_hmm_array,
            drop_hmm_array,
            outro_hmm_array,
        ]
    )

    return (
        temp,
        section_array,
    )


def dtw(excitement_array):
    """DTWの計算を行う"""
    # セクションは4小節ごとに考慮する
    short_excitement_array = list()
    sum = 0
    for i, e in enumerate(excitement_array, 1):
        if i % 4 == 0 and i != 0:
            short_excitement_array.append(round(sum / 4))
            sum = 0
        sum += e
    excitement_array = short_excitement_array
    # セクションが取るであろう盛り上がり度
    # intro, breakdown + buildup, drop, outro
    section_excitement = [0, 1, 3.3, 0]
    # 2つの時系列の長さ
    excitement_len = len(excitement_array)
    section_len = len(section_excitement)
    # 初期化
    dtw = calc_dtw(excitement_len, section_len, excitement_array, section_excitement)
    # セクションを決定する
    section_array = list()
    # 逆から考える
    dtw = dtw[::-1]
    # outroで終わるように調整
    for i in range(4):
        section_array.append(4)
    # 最小値を見ながらセクションを決定する
    for d in dtw[1:]:
        # 見る範囲
        start = section_array[-1] - 1
        end = section_array[-1] + 1
        section = d.index(min(d[start:end]))
        for i in range(4):
            section_array.append(section)
    # もとに戻す
    section_array = restore_section_array(section_array)
    return section_array


def calc_dtw(excitement_len, section_len, excitement_array, section_excitement):
    dtw = [
        [float("inf") for i in range(section_len + 1)]
        for j in range(excitement_len + 1)
    ]
    dtw[0][0] = 0
    # 累積を考える
    for i in range(1, excitement_len + 1):
        for j in range(1, section_len + 1):
            cost = abs(excitement_array[i - 1] - section_excitement[j - 1])
            dtw[i][j] = cost + min(dtw[i - 1][j - 1], dtw[i - 1][j])
    return dtw


def restore_section_array(section_array):
    section_array = section_array[::-1]
    section_array = section_array[4:]
    section_array = [s - 1 for s in section_array]
    for i in range(len(section_array)):
        if section_array[i] == 2 or section_array[i] == 3:
            section_array[i] += 1
    buildup_start = section_array.index(3) - 2
    buildup_end = section_array.index(3)
    section_array[buildup_start:buildup_end] = [2, 2]
    return section_array


def fix_Hmm(hmm_array, excitement_array):
    """小節毎に揃える"""
    for i in range(len(hmm_array)):
        if i % fix_len == 0:
            h = hmm_array[i]
            e = excitement_array[i]
        hmm_array[i] = h
        excitement_array[i] = e
    return hmm_array, excitement_array


def fix_Auto_Hmm(hmm_array, excitement_array, section_array):
    """セクションに合わせて揃える"""
    pre_section = -1
    for i in range(len(hmm_array)):
        if pre_section != section_array[i] or i % fix_len == 0:
            h = hmm_array[i]
            e = excitement_array[i]
        hmm_array[i] = h
        excitement_array[i] = e
        pre_section = section_array[i]

    return hmm_array, excitement_array


def choose_sound(excitement_array, hmm_array):
    """使用する音素材を選択する"""
    sound_list = list()
    for i in range(excitement_len):
        binary = format(hmm_array[i], "b").zfill(4)
        binary = binary[::-1]
        excitement = excitement_array[i]
        if i % fix_len == 0:
            random_sound_list = choose_sound_randomly()
        block_sound = list()
        for part in range(4):
            if binary[part] == "1":
                block_sound.append(random_sound_list[part][excitement])
            else:
                block_sound.append("null")
        sound_list.append(block_sound)

    return sound_list


def choose_sound_randomly():
    """音素材をランダムに選択する"""
    random_sound_list = list()
    drums_list = list()
    bass_list = list()
    synth_list = list()
    sequence_list = list()

    for i in range(5):
        drums_file = os.listdir("./TechnoTrance/Drums/" + str(i))
        drums_list.append(
            "./TechnoTrance/Drums/" + str(i) + "/" + random.choice(drums_file)
        )

        bass_file = os.listdir("./TechnoTrance/Bass/" + str(i))
        bass_list.append(
            "./TechnoTrance/Bass/" + str(i) + "/" + random.choice(bass_file)
        )

        synth_file = os.listdir("./TechnoTrance/Synth/" + str(i))
        synth_list.append(
            "./TechnoTrance/Synth/" + str(i) + "/" + random.choice(synth_file)
        )

        sequence_file = os.listdir("./TechnoTrance/Sequence/" + str(i))
        sequence_list.append(
            "./TechnoTrance/Sequence/" + str(i) + "/" + random.choice(sequence_file)
        )

    random_sound_list.append(drums_list)
    random_sound_list.append(bass_list)
    random_sound_list.append(synth_list)
    random_sound_list.append(sequence_list)

    return random_sound_list


def choose_sound_randomly_with_using_ratio_topic(
    part_name, part_id, part_sound_list, ratio_topic
):
    for i in range(5):
        df = read_from_csv("./lda/" + part_name + "/lda" + str(i) + ".csv")

        feature_names = df.index.values
        part_sound_name_list = []
        for j in range(len(feature_names)):
            part_name_list = (
                "./TechnoTrance/"
                + part_name
                + "/"
                + str(i)
                + "/"
                + feature_names[j]
                + ".wav"
            )
            part_sound_name_list.append(part_name_list)
        # print(part_name_list)
        # print(feature_names)
        calcs1 = []
        sum1 = 0
        for j in range(len(feature_names)):
            topics = np.array(df[j : j + 1])[0][0:]
            calc = 0
            for k in range(len(topics) - 1):
                calc += ratio_topic[part_id][i][k] * topics[k]
            calcs1.append(calc)
            sum1 += calc
        # print(sum1)
        sumex = 0
        # print(calcs1)
        for j in range(len(feature_names)):
            calcs1[j] = calcs1[j] / sum1
            sumex += calcs1[j]
        # print(calcs1)
        # print(sumex)

        # print(part_name_list)
        print("OK")
        # print(calcs1)

        selected_word = np.random.choice(part_sound_name_list, p=calcs1)
        # print(selected_word)
        print("OKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOK")
        part_sound_list.append(selected_word)
    return part_sound_list


def read_from_csv(path):
    df = pd.read_csv(path, header=0, index_col=0)

    return df


def give_chord(sound_list):
    """コードを付与"""
    chord = ["2", "5", "3", "6", "4", "6", "7", "1"]
    for i, sound in enumerate(sound_list, 0):
        for part in range(1, 4):
            sound[part] = re.sub("[0-9].wav", chord[i % 8] + ".wav", sound[part])

    return sound_list


def connect_sound(sound_list, projectid, mode, songid):
    """音素材を繋げる"""
    output_sound = AudioSegment.silent()
    output_sound = output_sound[0:0]
    for sound in sound_list:
        block_sound_exist = False
        for s in sound:
            if s != "null":
                if block_sound_exist:
                    block_sound = block_sound.overlay(AudioSegment.from_file(s))
                else:
                    block_sound = AudioSegment.from_file(s)
                    block_sound_exist = True

        output_sound = output_sound + block_sound
    connect_new_song(projectid, output_sound, mode, songid)
    # print(songid)
    # 楽曲を更新する
    # song_id = 0
    # with get_connection() as conn:
    #     with conn.cursor(cursor_factory=DictCursor) as cur:
    #         cur.execute(
    #             "INSERT INTO songs (project_id) VALUES (%s) RETURNING id", (projectid,)
    #         )
    #         song_id = cur.fetchone()[0]
    #         conn.commit()
    # print(song_id)
    return songid


def connect_new_song(projectid, output_sound, mode, songid):
    if mode == "create":
        songid = 0
        created = False
        while not created:
            if not os.path.exists(f"./project/{projectid }/songs/{songid}"):
                os.makedirs(f"./project/{projectid }/songs/{songid}", exist_ok=True)
                output_sound.export(
                    f"./project/{projectid}/songs/{songid}/song{songid}.wav",
                    format="wav",
                )
                created = True
                # sound = AudioSegment.from_wav("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".wav")
                # sound.export("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".mp3", format="mp3")
            else:
                songid = songid + 1
    else:
        os.makedirs(f"./project/{projectid }/songs/{songid}", exist_ok=True)
        output_sound.export(
            f"./project/{projectid}/songs/{songid}/song{songid}.wav",
            format="wav",
        )
    return songid


def initialize_Hmm():
    """HMMモデルの初期化"""
    """
    状態
     0000 0   0001 1   0010 2   0011 3
     0100 4   0101 5   0110 6   0111 7
     1000 8   1001 9   1010 10  1011 11
     1100 12  1101 13  1110 14  1111 15
    """
    # 出力確率（共通）
    emissprob = np.array(
        [
            [0, 0, 0, 0, 0],
            [0.4, 0.2, 0.2, 0.1, 0.1],
            [0.39, 0.21, 0.2, 0.1, 0.1],
            [0.25, 0.3, 0.25, 0.1, 0.1],
            [0.39, 0.21, 0.2, 0.1, 0.1],
            [0.25, 0.3, 0.25, 0.1, 0.1],
            [0.25, 0.3, 0.25, 0.1, 0.1],
            [0.15, 0.2, 0.3, 0.2, 0.15],
            [0.35, 0.25, 0.2, 0.1, 0.1],
            [0.2, 0.2, 0.3, 0.1, 0.1],
            [0.2, 0.2, 0.35, 0.15, 0.1],
            [0.1, 0.1, 0.2, 0.25, 0.35],
            [0.2, 0.2, 0.35, 0.15, 0.1],
            [0.1, 0.1, 0.2, 0.25, 0.35],
            [0.1, 0.1, 0.2, 0.25, 0.35],
            [0.05, 0.05, 0.25, 0.25, 0.4],
        ]
    )
    # no part
    no_part_hmm_model = get_no_part_hmm_model(emissprob)

    # intro
    intro_hmm_model = get_intro_hmm_model(emissprob)

    # breakdown
    breakdown_hmm_model = get_breakdown_hmm_model(emissprob)

    # buildup
    buildup_hmm_model = get_buildup_hmm_model(emissprob)

    # drop
    drop_hmm_model = get_drop_hmm_model(emissprob)

    # outro
    outro_hmm_model = get_outro_hmm_model(emissprob)
    return (
        no_part_hmm_model,
        intro_hmm_model,
        breakdown_hmm_model,
        buildup_hmm_model,
        drop_hmm_model,
        outro_hmm_model,
    )


def get_no_part_hmm_model(emissprob):
    no_part_startprob = np.array(
        [
            0,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
            0.06666666666,
        ]
    )
    no_part_transmat = np.array(
        [
            [
                0,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
            ]
        ]
        * 16
    )
    no_part_hmm_model = hmm.MultinomialHMM(n_components=16)
    no_part_hmm_model.startprob_ = no_part_startprob
    no_part_hmm_model.transmat_ = no_part_transmat
    no_part_hmm_model.n_features = 5
    no_part_hmm_model.emissionprob_ = emissprob
    return no_part_hmm_model


def get_intro_hmm_model(emissprob):
    intro_startprob = np.array(
        [
            0,
            0.1,
            0.8 / 13,
            0.1,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
            0.8 / 13,
        ]
    )
    intro_transmat = np.array([intro_startprob] * 16)

    intro_hmm_model = hmm.MultinomialHMM(n_components=16)
    intro_hmm_model.startprob_ = intro_startprob
    intro_hmm_model.transmat_ = intro_transmat
    intro_hmm_model.n_features = 5
    intro_hmm_model.emissionprob_ = emissprob

    return intro_hmm_model


def get_breakdown_hmm_model(emissprob):
    breakdown_startprob = np.array(
        [
            0,
            0.7 / 12,
            0.7 / 12,
            0.1,
            0.7 / 12,
            0.7 / 12,
            0.15,
            0.7 / 12,
            0.7 / 12,
            0.7 / 12,
            0.7 / 12,
            0.7 / 12,
            0.7 / 12,
            0.7 / 12,
            0.05,
            0.7 / 12,
        ]
    )

    breakdown_transmat = np.array([breakdown_startprob] * 16)

    breakdown_hmm_model = hmm.MultinomialHMM(n_components=16)
    breakdown_hmm_model.startprob_ = breakdown_startprob
    breakdown_hmm_model.transmat_ = breakdown_transmat
    breakdown_hmm_model.n_features = 5
    breakdown_hmm_model.emissionprob_ = emissprob
    return breakdown_hmm_model


def get_buildup_hmm_model(emissprob):
    buildup_startprob = np.array(
        [
            0,
            0.7 / 13,
            0.7 / 13,
            0.1,
            0.7 / 13,
            0.7 / 13,
            0.7 / 13,
            0.2,
            0.7 / 13,
            0.7 / 13,
            0.7 / 13,
            0.7 / 13,
            0.7 / 13,
            0.7 / 13,
            0.7 / 13,
            0.7 / 13,
        ]
    )
    buildup_transmat = np.array([buildup_startprob] * 16)

    buildup_hmm_model = hmm.MultinomialHMM(n_components=16)
    buildup_hmm_model.startprob_ = buildup_startprob
    buildup_hmm_model.transmat_ = buildup_transmat
    buildup_hmm_model.n_features = 5
    buildup_hmm_model.emissionprob_ = emissprob
    return buildup_hmm_model


def get_drop_hmm_model(emissprob):
    drop_startprob = np.array(
        [
            0,
            0.4 / 12,
            0.4 / 12,
            0.4 / 12,
            0.4 / 12,
            0.4 / 12,
            0.4 / 12,
            0.4 / 12,
            0.4 / 12,
            0.4 / 12,
            0.4 / 12,
            0.1,
            0.4 / 12,
            0.4 / 12,
            0.2,
            0.3,
        ]
    )
    drop_transmat = np.array([drop_startprob] * 16)

    drop_hmm_model = hmm.MultinomialHMM(n_components=16)
    drop_hmm_model.startprob_ = drop_startprob
    drop_hmm_model.transmat_ = drop_transmat
    drop_hmm_model.n_features = 5
    drop_hmm_model.emissionprob_ = emissprob
    return drop_hmm_model


def get_outro_hmm_model(emissprob):
    outro_startprob = np.array(
        [
            0,
            0.6 / 12,
            0.6 / 12,
            0.6 / 12,
            0.1,
            0.6 / 12,
            0.6 / 12,
            0.6 / 12,
            0.15,
            0.6 / 12,
            0.6 / 12,
            0.6 / 12,
            0.15,
            0.6 / 12,
            0.6 / 12,
            0.6 / 12,
        ]
    )
    outro_transmat = np.array([outro_startprob] * 16)

    outro_hmm_model = hmm.MultinomialHMM(n_components=16)
    outro_hmm_model.startprob_ = outro_startprob
    outro_hmm_model.transmat_ = outro_transmat
    outro_hmm_model.n_features = 5
    outro_hmm_model.emissionprob_ = emissprob
    return outro_hmm_model


if __name__ == "__main__":
    app.run(debug=True, port=8080, threaded=True)

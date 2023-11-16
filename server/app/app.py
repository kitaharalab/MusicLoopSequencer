import io
import os
import re

import firebase_admin
import numpy as np
import pandas as pd
from firebase_admin import credentials
from flask import Flask, jsonify, make_response, request, send_file
from flask_cors import CORS
from route.parts import parts
from route.parts.id.sounds import sounds
from route.parts.id.sounds.id import sound_id
from route.projects import projects
from route.projects.songs import songs
from sqls import create_song as add_song
from sqls import (
    get_excitement_curve,
    get_loop_music_by_id,
    get_loop_topic_by_id,
    get_parts,
    get_song_loop_ids,
    get_wav_data_from_song_id,
    play_loop_log,
    play_song_log,
    sound_array_wrap,
    update_song_details,
)
from util.connect_sound import connect_sound
from verify import require_auth

fix_len = 4
topic_n = 4
excitement_len = 32
selected_constitution_determine = 1
selected_fix_determine = 0

PARTS = ["Drums", "Bass", "Synth", "Sequence"]
part_name2index = {"Drums": 0, "Bass": 1, "Synth": 2, "Sequence": 3}


cred = credentials.Certificate("./credentials.json")
firebase_app = firebase_admin.initialize_app(cred)

app = Flask(__name__)
CORS(app)

app.register_blueprint(parts, url_prefix="/parts")
app.register_blueprint(sounds, url_prefix="/parts/<int:partid>/sounds")
# app.register_blueprint(sound_id, url_prefix="/parts/<int:partid>/sounds/<int:soundid>")
app.register_blueprint(projects)
app.register_blueprint(songs)


# TODO: 誤字の修正
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


# TODO: どこで使ってるか不明
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


def rewrite_music_data(measureid, partid, musicloopid, sound_array, adapt=0):
    # TODO: IDから音素材へのパスへと変換
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
    if adapt == 1:
        update_topic_ratio(sound_array, measureid, partid)
    return sound_array


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


def update_topic_ratio(sound_array, measureid, partid):
    # print("ここまでは大丈夫")
    # TODO: partidをむりやり変更，現在のIDから1を引けば同じになるという前提．measureIDも同様
    split_name = re.split("/|\.", str(sound_array[int(measureid)][int(partid) - 1]))
    # part_list = ["Drums", "Bass", "Synth", "Sequence"]
    pass_ratio_topic = f"./lda/{split_name[3]}/ratio_topic{split_name[4]}.txt"
    ratio_topic = read_file(pass_ratio_topic)

    for i in range(len(ratio_topic)):
        ratio_topic[i] = float(ratio_topic[i])
    # TODO: 音素材のpart name, その盛り上がり度
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

    # TODO: topic選好度をデータベースに入れる
    with open(pass_ratio_topic, mode="w") as f:
        for k in range(4):
            # print(k)
            if k == 0:
                f.write(str(ratio_topic[k]))
            else:
                f.write("\n" + str(ratio_topic[k]))


# TODO: デリートの実装
# @app.route(
#     "/projects/<projectid>/songs/<songid>/parts/<partid>/measures/<measureid>",
#     methods=["DELETE"],
# )
# @require_auth
# def delete_sound(projectid, songid, partid, measureid):
#     req = request.args
#     fix = req.get("fix")
#     sound_array = load_music_data(
#         "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
#     )

#     drums_list, bass_list, synth_list, sequence_list = get_sound_data()

#     sound_array = delete_music_loop(
#         measureid,
#         partid,
#         sound_array,
#         drums_list,
#         bass_list,
#         synth_list,
#         sequence_list,
#         fix,
#     )
#     # root = tk.Tk()
#     # view = View(master=root)
#     songid = connect_sound(sound_array, projectid, "delete", songid)

#     save_music_data(
#         projectid, songid, sound_array, drums_list, bass_list, synth_list, sequence_list
#     )

#     drums_list, bass_list, synth_list, sequence_list = format_list(sound_array)

#     response = {
#         "songid": int(songid),
#         "parts": [
#             {"partid": 0, "sounds": sequence_list},
#             {"partid": 1, "sounds": synth_list},
#             {"partid": 2, "sounds": bass_list},
#             {"partid": 3, "sounds": drums_list},
#         ],
#     }
#     return make_response(jsonify(response))


# def delete_music_loop(
#     measureid,
#     partid,
#     sound_array,
#     drums_list,
#     bass_list,
#     synth_list,
#     sequence_list,
#     fix,
# ):
#     if fix == 0:
#         sound_array[int(measureid)][3 - int(partid)] = None
#     else:
#         for i in range(4):
#             sound_array[int(int(measureid) / 4) * 4 + i][3 - int(partid)] = None

#     for i in range(len(sound_array)):
#         for j in range(len(sound_array[0])):
#             if j == 0:
#                 for k in range(len(drums_list)):
#                     if sound_array[i][j] == k:
#                         sound_array[i][j] = drums_list[k]
#                     elif sound_array[i][j] == None:
#                         sound_array[i][j] = "null"
#             elif j == 1:
#                 for k in range(len(bass_list)):
#                     if sound_array[i][j] == k:
#                         sound_array[i][j] = bass_list[k]
#                     elif sound_array[i][j] == None:
#                         sound_array[i][j] = "null"
#             elif j == 2:
#                 for k in range(len(synth_list)):
#                     if sound_array[i][j] == k:
#                         sound_array[i][j] = synth_list[k]
#                     elif sound_array[i][j] == None:
#                         sound_array[i][j] = "null"
#             else:
#                 for k in range(len(sequence_list)):
#                     if sound_array[i][j] == k:
#                         sound_array[i][j] = sequence_list[k]
#                     elif sound_array[i][j] == None:
#                         sound_array[i][j] = "null"
#     return sound_array


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


# TODO: 作成された曲なのでDBに変更したい
@app.route("/projects/<projectid>/songs/<songid>/wav", methods=["GET"])
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

    if data is None:
        return make_response(jsonify({"message": "指定された楽曲ファイルは存在しません"})), 204

    return send_file(io.BytesIO(data), mimetype="audio/wav")


@app.route("/parts/<int:partid>/musicloops/<musicloopid>/wav", methods=["POST"])
@require_auth
def log_loop_play(uid, partid, musicloopid):
    data = request.get_json()
    play_loop_log(data["projectId"], data["songId"], partid, musicloopid, uid)

    return make_response(jsonify({"message": "操作がログに書き込まれました"})), 200


@app.route("/parts/<int:partid>/musicloops/<int:musicloopid>/topic", methods=["GET"])
def get_topic_ratio(partid: int, musicloopid: int):
    loop_topic = get_loop_topic_by_id(musicloopid)
    return make_response(jsonify(loop_topic))


# INFO: 以下の処理は元々のデータからトピック選好度を持ってくるための処理
# part = "null"
# if partid == "0":
#     part = "sequence"
# elif partid == "1":
#     part = "synth"
# elif partid == "2":
#     part = "bass"
# else:
#     part = "drums"

# musicLoop_list = read_file("./text/" + part + "_word_list.txt")
# """bass_word_list.txt"""
# if musicLoop_list[len(musicLoop_list) - 1] == "":
#     musicLoop_list.pop()
# musicLoopName = "null"
# for i in range(len(musicLoop_list)):
#     if i == int(musicloopid):
#         musicLoopName = musicLoop_list[i]
# split_name = re.split("/|\.", musicLoopName)
# # print(split_name)
# # print(split_name[3], split_name[4], split_name[5])
# df = pd.read_csv(
#     "./lda/" + split_name[3] + "/lda" + split_name[4] + ".csv",
#     header=0,
#     index_col=0,
# )
# feature_names = df.index.values
# n = 0
# # print(split_name[3], split_name[4], split_name[5])
# for i in range(len(feature_names)):
#     if feature_names[i] == split_name[5]:
#         n = i
# topic_array = np.array(df[n : n + 1])[0][0:]

# # return send_file(
# #     "./TechnoTrance/"
# #     + split_name[3]
# #     + "/"
# #     + split_name[4]
# #     + "/"
# #     + split_name[5]
# #     + ".wav",
# #     as_attachment=True,
# # )
# return make_response(jsonify(list(topic_array)))


@app.route("/topic", methods=["GET"])
def get_topic_preference():
    ratio_topic = load_topic_preference()
    response = {"ratio-topic": ratio_topic}

    return make_response(jsonify(response))


# TODO: パートごと，盛り上がり度ごとのトピック選好度をデータベースから取得
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


# # TODO: DBに移行したい
# def connect_new_song(projectid, output_sound, mode, songid):
#     if mode == "create":
#         songid = 0
#         created = False
#         while not created:
#             if not os.path.exists(f"./project/{projectid }/songs/{songid}"):
#                 os.makedirs(f"./project/{projectid }/songs/{songid}", exist_ok=True)
#                 output_sound.export(
#                     f"./project/{projectid}/songs/{songid}/song{songid}.wav",
#                     format="wav",
#                 )
#                 created = True
#                 # sound = AudioSegment.from_wav("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".wav")
#                 # sound.export("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".mp3", format="mp3")
#             else:
#                 songid = songid + 1
#     else:
#         # TODO: insert(update)した後の音声データの書き込みがこれ．byteデータみたいなのだけ欲しい
#         os.makedirs(f"./project/{projectid }/songs/{songid}", exist_ok=True)
#         output_sound.export(
#             f"./project/{projectid}/songs/{songid}/song{songid}.wav",
#             format="wav",
#         )
#     return songid


if __name__ == "__main__":
    app.run(debug=True, port=8080, threaded=True)

import math
import os
import re
import tkinter as tk

# import numpy as np
# import pandas as pd
from flask import Flask, jsonify, make_response, request, send_file

# from flask import send_from_directory
from flask_cors import CORS
from part.get_part_name import get_part_name

# from model import Model
from view import View

# import urllib.parse


topic_n = 4
app = Flask(__name__)
CORS(app)


@app.route("/parts", methods=["GET"])
def infoParts():
    partids = []
    with open("./text/partid.txt") as f:
        partids = f.read().split()

    response = {"part-ids": partids}
    return make_response(jsonify(response))


@app.route("/parts/<partid>/sounds", methods=["GET"])
def infoSounds(partid):
    partName = get_part_name(int(partid))

    path = "./text/" + partName + "_word_list.txt"
    sounds = []
    with open(path) as f:
        sounds = f.read().split("\n")

    print(sounds[len(sounds) - 1])
    if sounds[len(sounds) - 1] == "":
        sounds.pop()
    soundIds = []
    for i in range(len(sounds)):
        soundIds.append(i)

    pass_movedpointx = "./text/" + partName + "_movedpointx_list" + ".txt"
    pass_movedpointy = "./text/" + partName + "_movedpointy_list" + ".txt"
    pass_range = "./text/" + partName + "_range_list" + ".txt"
    x_coordinate = []
    y_coordinate = []
    range_lists = []

    with open(pass_movedpointx) as f:
        x_coordinate = f.read().split("\n")
    with open(pass_movedpointy) as f:
        y_coordinate = f.read().split("\n")
    with open(pass_range) as f:
        range_lists = f.read().split("\n")

    if x_coordinate[len(x_coordinate) - 1] == "":
        x_coordinate.pop()

    if y_coordinate[len(y_coordinate) - 1] == "":
        y_coordinate.pop()

    if range_lists[len(range_lists) - 1] == "":
        range_lists.pop()

    for i in range(len(x_coordinate)):
        x_coordinate[i] = math.floor(float(x_coordinate[i]))
        y_coordinate[i] = math.floor(float(y_coordinate[i]))

    for i in range(len(range_lists)):
        range_lists[i] = int(range_lists[i])

    print(x_coordinate)
    print()
    print(y_coordinate)
    response = {
        "sound-ids": soundIds,
        "x_coordinate": x_coordinate,
        "y_coordinate": y_coordinate,
        "range_lists": range_lists,
    }
    return make_response(jsonify(response))


@app.route("/parts/<partid>/sounds/<soundid>", methods=["GET"])
def infoSound(partid, soundid):
    partid = int(partid)
    soundid = int(soundid)

    partName = get_part_name(partid)

    x_coordinate = []
    y_coordinate = []
    range_lists = []
    degree_of_excitement = 0

    pass_movedpointx = "./text/" + partName + "_movedpointx_list" + ".txt"
    pass_movedpointy = "./text/" + partName + "_movedpointy_list" + ".txt"
    pass_range = "./text/" + partName + "_range_list" + ".txt"

    with open(pass_movedpointx) as f:
        x_coordinate = f.read().split("\n")
    with open(pass_movedpointy) as f:
        y_coordinate = f.read().split("\n")
    with open(pass_range) as f:
        range_lists = f.read().split("\n")

    for i in range(len(x_coordinate)):
        x_coordinate[i] = float(x_coordinate[i])
        y_coordinate[i] = float(y_coordinate[i])
    if soundid < int(range_lists[0]):
        degree_of_excitement = 0
    elif int(range_lists[0]) <= soundid and soundid < int(range_lists[1]):
        degree_of_excitement = 1
    elif int(range_lists[1]) <= soundid and soundid < int(range_lists[2]):
        degree_of_excitement = 2
    elif int(range_lists[2]) <= soundid and soundid < int(range_lists[3]):
        degree_of_excitement = 3
    else:
        degree_of_excitement = 4

    if x_coordinate[len(x_coordinate) - 1] == "":
        x_coordinate.pop()
    if y_coordinate[len(y_coordinate) - 1] == "":
        y_coordinate.pop()
    sound_feature = [x_coordinate[soundid], y_coordinate[soundid]]

    response = {
        "sound-feature": sound_feature,
        "degree-of-excitement": degree_of_excitement,
    }
    return make_response(jsonify(response))


@app.route("/projects", methods=["POST"])
def createProject():
    projectId = 0
    created = False
    while not created:
        project_file_exist = os.path.exists("./project/" + str(projectId))
        if project_file_exist:
            projectId = projectId + 1
            continue

        os.mkdir("./project/" + str(projectId))
        os.mkdir("./project/" + str(projectId) + "/songs")
        os.mkdir("./project/" + str(projectId) + "/curve")
        created = True

    curves = ["271" for i in range(1152)]
    with open("./project/" + str(projectId) + "/curve/curve.txt", mode="w") as f:
        for i in range(len(curves)):
            if i == 0:
                f.write(str(curves[i]))
            else:
                f.write("\n" + str(curves[i]))
    print("project" + str(projectId) + " is created")
    response = {"projectid": projectId}
    return make_response(jsonify(response))


@app.route("/projects", methods=["GET"])
def infoProjects():
    dir_list = os.listdir("./project")
    for i in range(len(dir_list)):
        dir_list[i] = int(dir_list[i])
    dir_list = sorted(dir_list)
    response = {"projects_list": dir_list}
    return make_response(jsonify(response))


@app.route("/projects/<projectid>", methods=["GET"])
def infoProject(projectid):
    dir_list = os.listdir("./project/" + projectid + "/songs")
    number_of_sound = 0
    if len(dir_list) == 0:
        number_of_sound = 0
    else:
        number_of_sound = len(dir_list)
    curves = []
    with open("./project/" + projectid + "/curve/curve.txt") as f:
        curves = f.read().split("\n")
    if curves[len(curves) - 1] == "":
        curves.pop()
    for i in range(len(curves)):
        curves[i] = int(curves[i])
    response = {"number-of-sound": number_of_sound, "curves": curves}
    return make_response(jsonify(response))


def read_instrument_list_file(path: str) -> list | None:
    content_list = None
    with open(path) as f:
        content_list = f.read().split("\n")
    return content_list


@app.route("/projects/<projectid>/songs", methods=["POST"])
def createSong(projectid):
    data = request.get_json()  # WebページからのJSONデータを受け取る．
    curves = data["curves"]
    root = tk.Tk()
    view = View(master=root)  # 他のpyファイルのクラスを読み込む．
    array, songid = view.createMusic(curves, projectid)
    drums_list = read_instrument_list_file("./text/drums_word_list.txt")
    bass_list = read_instrument_list_file("./text/bass_word_list.txt")
    synth_list = read_instrument_list_file("./text/synth_word_list.txt")
    sequence_list = read_instrument_list_file("./text/sequence_word_list.txt")
    # drums_list = []
    # bass_list = []
    # synth_list = []
    # sequence_list = []
    # with open("./text/drums_word_list.txt") as f:
    #     drums_list = f.read().split("\n")
    # with open("./text/bass_word_list.txt") as f:
    #     bass_list = f.read().split("\n")
    # with open("./text/synth_word_list.txt") as f:
    #     synth_list = f.read().split("\n")
    # with open("./text/sequence_word_list.txt") as f:
    #     sequence_list = f.read().split("\n")

    instrument_lists = [drums_list, bass_list, synth_list, sequence_list]

    for i in range(len(array)):
        for j in range(len(array[0])):
            instrument_list = instrument_lists[j]
            for k in range(len(instrument_list)):
                if array[i][j] == instrument_list[k]:
                    array[i][j] = str(k)

    flatten_song_array = sum(array, [])
    flatten_song_array_str = list(map(str, flatten_song_array))
    song_text = "\n".join(flatten_song_array_str)
    with open(
        "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt",
        mode="w",
    ) as f:
        f.write(song_text)
        # for i in range(len(array)):
        #     for j in range(len(array[0])):
        #         if i == 0 and j == 0:
        #             f.write(str(array[i][j]))
        #         else:
        #             f.write("\n" + str(array[i][j]))

    sequence_list = ["null" for i in range(32)]
    synth_list = ["null" for i in range(32)]
    bass_list = ["null" for i in range(32)]
    drums_list = ["null" for i in range(32)]
    instrument_lists = [drums_list, bass_list, synth_list, sequence_list]

    for i in range(32):
        for j in range(len(instrument_lists)):
            if array[i][j] == "null":
                instrument_lists[j][i] = None
            else:
                instrument_lists[j][i] = int(array[i][j])

        # if array[i][3] == "null":
        #     sequence_list[i] = None
        # else:
        #     sequence_list[i] = int(array[i][3])
        # if array[i][2] == "null":
        #     synth_list[i] = None
        # else:
        #     synth_list[i] = int(array[i][2])
        # if array[i][1] == "null":
        #     bass_list[i] = None
        # else:
        #     bass_list[i] = int(array[i][1])
        # if array[i][0] == "null":
        #     drums_list[i] = None
        # else:
        #     drums_list[i] = int(array[i][0])

    print(instrument_lists[-1])
    # print(sequence_list)

    response = {
        "songid": int(songid),
        "parts": [
            {"partid": 0, "sounds": instrument_lists[3]},
            {"partid": 1, "sounds": instrument_lists[2]},
            {"partid": 2, "sounds": instrument_lists[1]},
            {"partid": 3, "sounds": instrument_lists[0]},
        ],
    }
    # response = {
    #     "songid": int(songid),
    #     "parts": [
    #         {"partid": 0, "sounds": sequence_list},
    #         {"partid": 1, "sounds": synth_list},
    #         {"partid": 2, "sounds": bass_list},
    #         {"partid": 3, "sounds": drums_list},
    #     ],
    # }
    return make_response(jsonify(response))


@app.route("/projects/<projectid>/songs", methods=["GET"])
def infoSongs(projectid):
    songids = os.listdir("./project/" + projectid + "/songs")
    for i in range(len(songids)):
        songids[i] = int(songids[i])
    songids = sorted(songids)
    print(songids)
    response = {"songids": songids}
    return make_response(jsonify(response))


@app.route("/projects/<projectid>/songs/<songid>", methods=["GET"])
def infoSong(projectid, songid):
    sounds_ids = [["null" for i in range(4)] for j in range(32)]
    id_list = []
    # path = "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    with open(
        "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    ) as f:
        id_list = f.read().split("\n")
    if id_list[len(id_list) - 1] == "":
        id_list.pop()
    count = 0

    for i in range(len(id_list)):
        sounds_ids[count][i % 4] = id_list[i]
        if i % 4 == 3:
            count = count + 1
    sequence_list = ["null" for i in range(32)]
    synth_list = ["null" for i in range(32)]
    bass_list = ["null" for i in range(32)]
    drums_list = ["null" for i in range(32)]

    for i in range(32):
        if sounds_ids[i][3] == "null":
            sequence_list[i] = None
        else:
            sequence_list[i] = int(sounds_ids[i][3])
        if sounds_ids[i][2] == "null":
            synth_list[i] = None
        else:
            synth_list[i] = int(sounds_ids[i][2])
        if sounds_ids[i][1] == "null":
            bass_list[i] = None
        else:
            bass_list[i] = int(sounds_ids[i][1])
        if sounds_ids[i][0] == "null":
            drums_list[i] = None
        else:
            drums_list[i] = int(sounds_ids[i][0])

    # response = {"sounds_ids": sounds_ids}
    response = {
        "parts": [
            {"partid": 0, "sounds": sequence_list},
            {"partid": 1, "sounds": synth_list},
            {"partid": 2, "sounds": bass_list},
            {"partid": 3, "sounds": drums_list},
        ]
    }

    return make_response(jsonify(response))


@app.route("/projects/<projectid>/songs/<songid>/parts/<partid>", methods=["GET"])
def infoSongPart(projectid, songid, partid):
    sounds_ids = [["null" for i in range(4)] for j in range(32)]
    id_list = []
    # path = "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    with open(
        "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    ) as f:
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
def infoSongPartMeasure(projectid, songid, partid, measureid):
    sounds_ids = [["null" for i in range(4)] for j in range(32)]
    id_list = []
    # path = "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    with open(
        "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    ) as f:
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
    "/projects/<projectid>/parts/<partid>/measures/<measureid>/musicloops/<musicloopid>",
    methods=["POST"],
)
def insertSound(projectid, partid, measureid, musicloopid):
    data = request.get_json()  # WebページからのJSONデータを受け取る．
    sequence_list = data["sequenceList"]
    synth_list = data["synthList"]
    bass_list = data["bassList"]
    drums_list = data["drumsList"]

    # sounds_ids = [["null" for i in range(4)] for j in range(32)]
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

    # id_list = []
    # path = "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    # with open(
    #     "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt"
    # ) as f:
    #     id_list = f.read().split("\n")
    # if id_list[len(id_list) - 1] == "":
    #     id_list.pop()
    # count = 0

    # for i in range(len(id_list)):
    #    sounds_ids[count][i%4] = id_list[i]
    #    if i%4 == 3:
    #        count = count + 1
    # sound_list = []

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

    # if partid == '0':
    #    sound_list = sequence_list
    # elif partid == '1':
    #    sound_list = synth_list
    # elif partid == '2':
    #    sound_list = bass_list
    # else:
    #    sound_list = drums_list
    if int(partid) == 0:
        sound_array[int(measureid)][3 - int(partid)] = int(musicloopid)
    elif int(partid) == 1:
        sound_array[int(measureid)][3 - int(partid)] = int(musicloopid)
    elif int(partid) == 2:
        sound_array[int(measureid)][3 - int(partid)] = int(musicloopid)
    else:
        sound_array[int(measureid)][3 - int(partid)] = int(musicloopid)

    # for i in range(len(sound_list)):
    #    if i == int(sound_id):
    #        soundName = sound_list[i]

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

    root = tk.Tk()
    view = View(master=root)
    print(sound_array)
    print("OKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOK")
    songid = view.model.connectSound(sound_array, projectid)

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
    with open(
        "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt",
        mode="w",
    ) as f:
        for i in range(len(sound_array)):
            for j in range(len(sound_array[0])):
                if i == 0 and j == 0:
                    f.write(str(sound_array[i][j]))
                else:
                    f.write("\n" + str(sound_array[i][j]))

    sequence_list = ["null" for i in range(32)]
    synth_list = ["null" for i in range(32)]
    bass_list = ["null" for i in range(32)]
    drums_list = ["null" for i in range(32)]

    for i in range(32):
        if sound_array[i][3] == "null":
            sequence_list[i] = None
        else:
            sequence_list[i] = int(sound_array[i][3])
        if sound_array[i][2] == "null":
            synth_list[i] = None
        else:
            synth_list[i] = int(sound_array[i][2])
        if sound_array[i][1] == "null":
            bass_list[i] = None
        else:
            bass_list[i] = int(sound_array[i][1])
        if sound_array[i][0] == "null":
            drums_list[i] = None
        else:
            drums_list[i] = int(sound_array[i][0])
    print(sequence_list)

    print(songid)

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


"""@app.route("/projects/<projectid>/songs/<songid>/<filename>", methods=['GET'])
def downloadSong(projectid,songid,filename):
    filepath = "./project/" + projectid + "/songs/" + songid + "/" + filename
    response = make_response(filepath)
    response.headers['Content-Type'] = 'audio/wav'
    response.headers['Content-Disposition'] = 'attachment; filename=' + filename
    return response"""


@app.route("/projects/<projectid>/songs/<songid>/wav", methods=["GET"])
def downloadSong(projectid, songid):
    return send_file(
        "./project/" + projectid + "/songs/" + songid + "/song" + songid + ".wav",
        as_attachment=True,
    )


@app.route("/parts/<partid>/musicloops/<musicloopid>/wav", methods=["GET"])
def downloadMusicLoop(partid, musicloopid):
    part = "null"
    if partid == "0":
        part = "sequence"
    elif partid == "1":
        part = "synth"
    elif partid == "2":
        part = "bass"
    else:
        part = "drums"

    musicLoop_list = []
    """bass_word_list.txt"""
    with open("./text/" + part + "_word_list.txt") as f:
        musicLoop_list = f.read().split("\n")
    if musicLoop_list[len(musicLoop_list) - 1] == "":
        musicLoop_list.pop()
    musicLoopName = "null"
    for i in range(len(musicLoop_list)):
        if i == int(musicloopid):
            musicLoopName = musicLoop_list[i]
    split_name = re.split("/|\.", musicLoopName)
    print(split_name)
    print(split_name[3], split_name[4], split_name[5])

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


if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)

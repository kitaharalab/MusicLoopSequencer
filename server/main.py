from flask import Flask, send_file, send_from_directory
from flask import request, make_response, jsonify
from flask_cors import CORS
from view import View
from model import Model
from hmmlearn import hmm 
from pydub import AudioSegment  
from pydub.playback import play  
import tkinter as tk
import os
import random
import re
import math
import numpy as np
import pandas as pd
import urllib.parse
fix_len = 4
topic_n = 3

excitement_len = 32
selected_constitution_determine = 1
selected_fix_determine = 1
app = Flask(__name__)
CORS(app)
@app.route("/parts", methods=['GET'])
def get_infomation_of_parts():
    partids = read_file("./text/partid.txt")
        
    response = {'part-ids': partids}
    return make_response(jsonify(response))

def read_file(path):
    data_list = []
    with open(path) as f:
        data_list = f.read().split("\n")

    return data_list



@app.route("/parts/<partid>/sounds", methods=['GET'])
def get_infomation_of_sounds(partid):
    partid = int(partid)
    partName = ""
    if partid == 0:
        partName = "sequence"
    elif partid == 1:
        partName = "synth"
    elif partid == 2:
        partName = "bass"
    else:
        partName = "drums"
        
    sounds = read_file("./text/" + partName + "_word_list.txt")
    

    print(sounds[len(sounds)-1])
    if sounds[len(sounds)-1] == '':
        sounds.pop()
    soundIds= []
    for i in range(len(sounds)):
        soundIds.append(i)
        
    x_coordinate, y_coordinate, range_lists = get_coordinate(partName)

    response = {'sound-ids': soundIds,
    		'x_coordinate': x_coordinate,
    		'y_coordinate': y_coordinate,
    		'range_lists': range_lists}
    return make_response(jsonify(response))

def get_coordinate(partName):
    
    x_coordinate = read_file("./text/" + partName + "_movedpointx_list" + ".txt")
    y_coordinate = read_file("./text/" + partName + "_movedpointy_list" + ".txt")
    range_lists = read_file("./text/" + partName + "_range_list" + ".txt")
    
    if x_coordinate[len(x_coordinate)-1] == '':
        x_coordinate.pop()
        
    if y_coordinate[len(y_coordinate)-1] == '':
        y_coordinate.pop()
    
    if range_lists[len(range_lists)-1] == '':
        range_lists.pop()
        
    for i in range(len(x_coordinate)):
    	x_coordinate[i] = math.floor(float(x_coordinate[i]))
    	y_coordinate[i] = math.floor(float(y_coordinate[i]))
    	
    for i in range(len(range_lists)):
    	range_lists[i] = int(range_lists[i])
    return x_coordinate, y_coordinate, range_lists


@app.route("/parts/<partid>/sounds/<soundid>", methods=['GET'])
def get_infomation_sound(partid,soundid):
    partid = int(partid)
    soundid = int(soundid)

    if partid == 0:
        partName = "sequence"
    elif partid == 1:
        partName = "synth"
    elif partid == 2:
        partName = "bass"
    else:
        partName = "drums"
    x_coordinate,y_coordinate, range_lists = get_coordinate(partName)
    degree_of_excitement = 0

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

    sound_feature = [x_coordinate[soundid], y_coordinate[soundid]]
    
    response = {"sound-feature": sound_feature,
                "degree-of-excitement": degree_of_excitement}
    return make_response(jsonify(response))
@app.route("/projects", methods=['POST'])
def create_project():
    projectId = create_project_and_get_projectId
    curves = ["271" for i in range(1152)]
    write_file("./project/" + str(projectId) + "/curve/curve.txt", curves)
    
    print("project" + str(projectId) + " is created")
    response = {"projectid": projectId}
    return make_response(jsonify(response))

def create_project_and_get_projectId():
    projectId = 0
    created = False
    while created == False:
        if os.path.exists("./project/" + str(projectId)) == False:
            os.mkdir("./project/" + str(projectId))
            os.mkdir("./project/" + str(projectId) + "/songs")
            os.mkdir("./project/" + str(projectId) + "/curve")
            created = True
        else:
            projectId = projectId + 1
    return projectId

def write_file(path, data_list):
    with open(path, mode= 'w') as f:
        for i in range(len(data_list)):
            if i == 0:
                f.write(str(data_list[i]))
            else:
                f.write("\n" + str(data_list[i]))



@app.route("/projects", methods=['GET'])
def get_infomation_of_projects():
    dir_list = get_list_of_directory("./project")
    for i in range(len(dir_list)):
    	dir_list[i] = int(dir_list[i])
    dir_list = sorted(dir_list)
    response = {"projects_list": dir_list}
    return make_response(jsonify(response))

def get_list_of_directory(path):
    dir_list = os.listdir(path)
    return dir_list
@app.route("/projects/<projectid>", methods=['GET'])
def get_infomation_of_project(projectid):
    dir_list = get_list_of_directory("./project/" + projectid + "/songs")
    number_of_sound = 0
    if len(dir_list) == 0:
        number_of_sound = 0
    else:
        number_of_sound = len(dir_list)
    curves = []
    curves = read_file("./project/" + projectid + "/curve/curve.txt")
    if curves[len(curves)-1] == '':
        curves.pop()
    for i in range(len(curves)):
        curves[i] = int(curves[i])
    response = {"number-of-sound": number_of_sound,
                "curves": curves}
    return make_response(jsonify(response))
@app.route("/projects/<projectid>/songs", methods=['POST'])
def create_song(projectid):
    data = request.get_json()      #WebページからのJSONデータを受け取る．
    curves = data['curves']
    req = request.args
    fix = req.get("fix")
    structure = req.get("structure")
    #root = tk.Tk()                 
    #view = View(master=root)       #他のpyファイルのクラスを読み込む．
    #array, songid = view.createMusic(curves, projectid)
    array, songid, section_array = createMusic(curves, projectid, fix, structure)
    drums_list, bass_list, synth_list, sequence_list, array = name_to_id(projectid,songid,array)

    drums_list, bass_list, synth_list, sequence_list = format_list(array)
    
    response = create_response(section_array, songid, drums_list, bass_list, synth_list, sequence_list)  
    print(response)

    return make_response(jsonify(response))

def name_to_id(projectid, songid, array):
    drums_list = read_file("./text/drums_word_list.txt")
    bass_list = read_file("./text/bass_word_list.txt")
    synth_list = read_file("./text/synth_word_list.txt")
    sequence_list = read_file("./text/sequence_word_list.txt")
    
    for i in range(len(array)):
        for j in range(len(array[0])):
            if j == 0:
                for k in range(len(drums_list)):
                    if array[i][j] == drums_list[k]:
                        array[i][j] = str(k)
            elif j == 1:
                for k in range(len(bass_list)):
                    if array[i][j] == bass_list[k]:
                        array[i][j] = str(k)
            elif j == 2:
                for k in range(len(synth_list)):
                    if array[i][j] == synth_list[k]:
                        array[i][j] = str(k)
            else:
                for k in range(len(sequence_list)):
                    if array[i][j] == sequence_list[k]:
                        array[i][j] = str(k)
    
    write_data_of_song("./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt", array)
    
    return drums_list, bass_list, synth_list, sequence_list, array

def write_data_of_song(path, array):
    with open(path, mode='w') as f:
        for i in range(len(array)):
            for j in range(len(array[0])):
                if i == 0 and j == 0:
                    f.write(str(array[i][j]))
                else:
                    f.write("\n" + str(array[i][j]))
    

def format_list(array):
    drums_list, bass_list, synth_list, sequence_list = ["null" for i in range(32)], ["null" for i in range(32)], ["null" for i in range(32)], ["null" for i in range(32)]

    for i in range(32):
        if array[i][0] == "null":
            drums_list[i] = None
        else:
            drums_list[i] = int(array[i][0])
        if array[i][1] == "null":
            bass_list[i] = None
        else:
            bass_list[i] = int(array[i][1])
        if array[i][2] == "null":
            synth_list[i] = None
        else:
            synth_list[i] = int(array[i][2])
        if array[i][3] == "null":
            sequence_list[i] = None
        else:
            sequence_list[i] = int(array[i][3])
    
    return drums_list, bass_list, synth_list, sequence_list

def create_response(section_array, songid, drums_list, bass_list, synth_list, sequence_list):
    response = None
    if section_array == '':
        response = {'songid': int(songid),
                    'parts':[{
                              'partid':0,
                              'sounds':sequence_list
                             },
                             {
                              'partid':1,
                              'sounds':synth_list
                             },
                             {
                              'partid':2,
                              'sounds':bass_list
                             },
                             {
                              'partid':3,
                              'sounds':drums_list
                             }
                             ]
                             }
    else:
        response = {'songid': int(songid),
                    'parts':[{
                              'partid':0,
                              'sounds':sequence_list
                             },
                             {
                              'partid':1,
                              'sounds':synth_list
                             },
                             {
                              'partid':2,
                              'sounds':bass_list
                             },
                             {
                              'partid':3,
                              'sounds':drums_list
                             }
                             ],
                    'section':[
                               ]
                             }
    print(section_array)
    id, start, end = 0, 0, 0
    section_name = ["intro", "breakdown", "buildup", "drop", "outro"]
    for i in range(len(section_array)):
        if id != section_array[i]:
            end = i - 1
            section = {
                        'start':start,
                        'end':end,
                        'section_name':section_name[section_array[i-1]]
                      }
            response['section'].append(section)
            start = i
            id = section_array[i]
        if i == len(section_array) - 1:
            end = len(section_array) - 1
            section = {
                        'start':start,
                        'end':end,
                        'section_name':section_name[section_array[i]]
                      }
            response['section'].append(section)

    return response
# {
#                                 'index':1,
#                                 'border':section_array.index(1)#intro-breakdown間
#                                },
#                                {
#                                 'index':2,
#                                 'border':section_array.index(2)#breakdown-buildup間
#                                },
#                                {
#                                 'index':3,
#                                 'border':section_array.index(3)#buildup-drop間
#                                },
#                                {
#                                 'index':4,
#                                 'border':section_array.index(4)#drop-outro間
#                                }
        

@app.route("/projects/<projectid>/songs", methods=['GET'])
def get_infomation_songs(projectid):
    songids = get_list_of_directory("./project/" + projectid + "/songs")
    for i in range(len(songids)):
        songids[i] = int(songids[i])
    songids = sorted(songids)
    print(songids)
    response = {"songids": songids}
    return make_response(jsonify(response))
@app.route("/projects/<projectid>/songs/<songid>", methods=['GET'])
def get_infomation_song(projectid,songid):
    sounds_ids = [["null" for i in range(4)] for j in range(32)]
    id_list = read_file("./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt")
    
    if id_list[len(id_list)-1] == '':
        id_list.pop()
    count = 0
    
    for i in range(len(id_list)):
        sounds_ids[count][i%4] = id_list[i]
        if i%4 == 3:
            count = count + 1

    drums_list, bass_list, synth_list, sequence_list = format_list(sound_ids)
    #response = {"sounds_ids": sounds_ids}
    response = {'parts':[{
                          'partid':0,
                          'sounds':sequence_list
                         },
                         {
                          'partid':1,
                          'sounds':synth_list
                         },
                         {
                          'partid':2,
                          'sounds':bass_list
                         },
                         {
                          'partid':3,
                          'sounds':drums_list
                         }
                         ]
                         }                     
    return make_response(jsonify(response))
@app.route("/projects/<projectid>/songs/<songid>/parts/<partid>", methods=['GET'])
def get_infomation_of_inserted_sounds_in_selected_part(projectid,songid,partid):
    sounds_ids = [["null" for i in range(4)] for j in range(32)]
    id_list = read_file("./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt")
    
    if id_list[len(id_list)-1] == '':
        id_list.pop()
    count = 0
    
    for i in range(len(id_list)):
        sounds_ids[count][i%4] = id_list[i]
        if i%4 == 3:
            count = count + 1
    partid_list = ["null" for i in range(32)]

    for i in range(32):
        if partid == '0':
            partid_list[i] = sounds_ids[i][3]
        elif partid == '1':
            partid_list[i] = sounds_ids[i][2]
        elif partid == '2':
            partid_list[i] = sounds_ids[i][1]
        else:
            partid_list[i] = sounds_ids[i][0]
    
    #response = {"sounds_ids": sounds_ids}
    response = {'partid':partid,'sounds':partid_list}

                         
    return make_response(jsonify(response))
@app.route("/projects/<projectid>/songs/<songid>/parts/<partid>/measures/<measureid>", methods=['GET'])
def get_infomation_of_inserted_sound(projectid,songid,partid, measureid):
    sounds_ids = [["null" for i in range(4)] for j in range(32)]
    id_list = read_file("./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt")
    
    if id_list[len(id_list)-1] == '':
        id_list.pop()
    count = 0
    
    for i in range(len(id_list)):
        sounds_ids[count][i%4] = id_list[i]
        if i%4 == 3:
            count = count + 1
    partid_measureid_sound = ''

    for i in range(32):
        if partid == '0':
            partid_measureid_sound = sounds_ids[int(measureid)][3]
        elif partid == '1':
            partid_measureid_sound = sounds_ids[int(measureid)][2]
        elif partid == '2':
            partid_measureid_sound = sounds_ids[int(measureid)][1]
        else:
            partid_measureid_sound = sounds_ids[int(measureid)][0]
    
    #response = {"sounds_ids": sounds_ids}
    response = {'partid':partid,
                'measureid':measureid,
                'sound':partid_measureid_sound}
                         
    return make_response(jsonify(response))
@app.route("/projects/<projectid>/songs/<songid>/parts/<partid>/measures/<measureid>/musicloops/<musicloopid>", methods=['POST'])
def insert_sound(projectid, songid, partid, measureid, musicloopid):
    req = request.args
    fix = req.get("fix")
    adapt = req.get("adapt")
    sound_array = load_music_data("./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt")
    
    drums_list, bass_list, synth_list, sequence_list = get_sound_data()
    
    sound_array = rewrite_music_data(measureid, partid, musicloopid, sound_array, drums_list, bass_list, synth_list, sequence_list, fix, adapt)
    #root = tk.Tk()                 
    #view = View(master=root)
    sound_array = give_chord(sound_array)
    songid = connect_sound(sound_array, projectid, "insert", songid)

    save_music_data(projectid, songid, sound_array, drums_list, bass_list, synth_list, sequence_list)
    
    drums_list, bass_list, synth_list, sequence_list = format_list(sound_array)
        
    response = {'songid': int(songid),
                'parts':[{
                          'partid':0,
                          'sounds':sequence_list
                         },
                         {
                          'partid':1,
                          'sounds':synth_list
                         },
                         {
                          'partid':2,
                          'sounds':bass_list
                         },
                         {
                          'partid':3,
                          'sounds':drums_list
                         }
                         ]
                         }
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
    print(sound_array)

    for i in range(len(data_list)):
        if data_list[i] != 'null':
            sound_array[measure_number][i%4] = int(data_list[i])
        else :
            sound_array[measure_number][i%4] = None
        if i%4 == 3:
            measure_number += 1
    print(sound_array)
    return sound_array

def get_sound_data():
    drums_list = read_file("./text/drums_word_list.txt")
    bass_list = read_file("./text/bass_word_list.txt")
    synth_list = read_file("./text/synth_word_list.txt")
    sequence_list = read_file("./text/sequence_word_list.txt")
    
    return drums_list, bass_list, synth_list, sequence_list

def rewrite_music_data(measureid, partid, musicloopid, sound_array, drums_list, bass_list, synth_list, sequence_list, fix, adapt):
    if fix == 0:
        sound_array[int(measureid)][3-int(partid)] = int(musicloopid)
    else:
        for i in range(4):
            sound_array[int(int(measureid)/4) *4+ i][3-int(partid)] = int(musicloopid)
        
    for i in range(len(sound_array)):
        for j in range(len(sound_array[0])):
            if j == 0:
                for k in range(len(drums_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = drums_list[k]
                    elif sound_array[i][j] == None:
                        sound_array[i][j] = 'null'
            elif j == 1:
                for k in range(len(bass_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = bass_list[k]
                    elif sound_array[i][j] == None:
                        sound_array[i][j] = 'null'
            elif j == 2:
                for k in range(len(synth_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = synth_list[k]
                    elif sound_array[i][j] == None:
                        sound_array[i][j] = 'null'
            else:
                for k in range(len(sequence_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = sequence_list[k]
                    elif sound_array[i][j] == None:
                        sound_array[i][j] = 'null'
    if adapt == 1:
        update_topic_ratio(sound_array, measureid, partid)
    return sound_array

def save_music_data(projectid, songid, sound_array, drums_list, bass_list, synth_list, sequence_list):
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
    write_data_of_song("./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt", sound_array)
    #with open("./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt", mode='w') as f:
    #    for i in range(len(sound_array)):
    #        for j in range(len(sound_array[0])):
    #            if i == 0 and j == 0:
    #                f.write(str(sound_array[i][j]))
    #            else:
    #                f.write("\n" + str(sound_array[i][j]))

def update_topic_ratio(sound_array, measureid, partid):
    print(sound_array[int(measureid)][3-int(partid)])
    print("ここまでは大丈夫")
    split_name = re.split('/|\.', sound_array[int(measureid)][3-int(partid)])
    part_list = ["Drums", "Bass", "Synth", "Sequence"]
    pass_ratio_topic = './lda/' + split_name[3] + '/ratio_topic' + split_name[4] + '.txt'
    ratio_topic = read_file(pass_ratio_topic)
    print(ratio_topic)
    for i in range(len(ratio_topic)):
        ratio_topic[i] = float(ratio_topic[i])
    df = pd.read_csv('./lda/' + split_name[3] + '/lda' + split_name[4] + '.csv', header=0,index_col=0)
    feature_names = df.index.values
    n = 0
    print(split_name[3],split_name[4],split_name[5])
    for i in range(len(feature_names)):
        if feature_names[i] == split_name[5]:
            n = i
    topic_array = np.array(df[n:n+1])[0][0:]
    for i in range(topic_n):
        ratio_topic[i] += topic_array[i]
    
    
    with open(pass_ratio_topic, mode = 'w') as f:
        for k in range(4):
            print(k)
            if k == 0:
                f.write(str(ratio_topic[k]))
            else:
                f.write("\n" + str(ratio_topic[k]))

def read_file(path):
    data_list = []
    with open(path) as f:
        data_list = f.read().split("\n")

    return data_list

@app.route("/projects/<projectid>/songs/<songid>/parts/<partid>/measures/<measureid>", methods=['DELETE'])
def delete_sound(projectid, songid, partid, measureid):
    req = request.args
    fix = req.get("fix")
    sound_array = load_music_data("./project/" + projectid + "/songs/" + songid + "/song" + songid + ".txt")
    
    drums_list, bass_list, synth_list, sequence_list = get_sound_data()
    
    sound_array = delete_music_loop(measureid, partid, sound_array, drums_list, bass_list, synth_list, sequence_list, fix)
    #root = tk.Tk()                 
    #view = View(master=root)
    songid = connect_sound(sound_array, projectid, "delete", songid)

    save_music_data(projectid, songid, sound_array, drums_list, bass_list, synth_list, sequence_list)
    
    drums_list, bass_list, synth_list, sequence_list = format_list(sound_array)
        
    response = {'songid': int(songid),
                'parts':[{
                          'partid':0,
                          'sounds':sequence_list
                         },
                         {
                          'partid':1,
                          'sounds':synth_list
                         },
                         {
                          'partid':2,
                          'sounds':bass_list
                         },
                         {
                          'partid':3,
                          'sounds':drums_list
                         }
                         ]
                         }
    return make_response(jsonify(response))

def delete_music_loop(measureid, partid, sound_array, drums_list, bass_list, synth_list, sequence_list, fix):
    if fix == 0:
        sound_array[int(measureid)][3-int(partid)] = None
    else:
        for i in range(4):
            sound_array[int(int(measureid)/4) *4+ i][3-int(partid)] = None
        
    for i in range(len(sound_array)):
        for j in range(len(sound_array[0])):
            if j == 0:
                for k in range(len(drums_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = drums_list[k]
                    elif sound_array[i][j] == None:
                        sound_array[i][j] = 'null'
            elif j == 1:
                for k in range(len(bass_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = bass_list[k]
                    elif sound_array[i][j] == None:
                        sound_array[i][j] = 'null'
            elif j == 2:
                for k in range(len(synth_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = synth_list[k]
                    elif sound_array[i][j] == None:
                        sound_array[i][j] = 'null'
            else:
                for k in range(len(sequence_list)):
                    if sound_array[i][j] == k:
                        sound_array[i][j] = sequence_list[k]
                    elif sound_array[i][j] == None:
                        sound_array[i][j] = 'null'
    return sound_array


"""@app.route("/projects/<projectid>/songs/<songid>/<filename>", methods=['GET'])
def downloadSong(projectid,songid,filename):
    filepath = "./project/" + projectid + "/songs/" + songid + "/" + filename
    response = make_response(filepath)
    response.headers['Content-Type'] = 'audio/wav'
    response.headers['Content-Disposition'] = 'attachment; filename=' + filename
    return response"""
@app.route("/projects/<projectid>/songs/<songid>/wav", methods=['GET'])
def download_song(projectid,songid):
    return send_file("./project/" + projectid + "/songs/" + songid + "/song" +songid + ".wav", as_attachment=True)
@app.route("/parts/<partid>/musicloops/<musicloopid>/wav", methods=['GET'])
def download_musicloop(partid,musicloopid):
    part = "null"
    if partid == "0":
        part = "sequence"
    elif partid == "1":
        part = "synth"
    elif partid == "2":
        part = "bass"
    else:
        part = "drums"
    	
    musicLoop_list = read_file("./text/" + part +"_word_list.txt")
    """bass_word_list.txt"""
    if musicLoop_list[len(musicLoop_list)-1] == '':
        musicLoop_list.pop()
    musicLoopName = "null"
    for i in range(len(musicLoop_list)):
        if i == int(musicloopid):
            musicLoopName = musicLoop_list[i]
    split_name = re.split('/|\.', musicLoopName)
    print(split_name)
    print(split_name[3], split_name[4], split_name[5])
    
    return send_file("./TechnoTrance/" + split_name[3] + "/" + split_name[4] + "/" + split_name[5] + ".wav", as_attachment=True)

@app.route("/parts/<partid>/musicloops/<musicloopid>/topic", methods=['GET'])
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
    	
    musicLoop_list = read_file("./text/" + part +"_word_list.txt")
    """bass_word_list.txt"""
    if musicLoop_list[len(musicLoop_list)-1] == '':
        musicLoop_list.pop()
    musicLoopName = "null"
    for i in range(len(musicLoop_list)):
        if i == int(musicloopid):
            musicLoopName = musicLoop_list[i]
    split_name = re.split('/|\.', musicLoopName)
    print(split_name)
    print(split_name[3], split_name[4], split_name[5])
    df = pd.read_csv('./lda/' + split_name[3] + '/lda' + split_name[4] + '.csv', header=0,index_col=0)
    feature_names = df.index.values
    n = 0
    print(split_name[3],split_name[4],split_name[5])
    for i in range(len(feature_names)):
        if feature_names[i] == split_name[5]:
            n = i
    topic_array = np.array(df[n:n+1])[0][0:]
    
    return send_file("./TechnoTrance/" + split_name[3] + "/" + split_name[4] + "/" + split_name[5] + ".wav", as_attachment=True)    

@app.route("/topics/", methods=['GET'])
def get_topic_preference():
    ratio_topic = load_topic_preference()
    response = {'ratio-topic':ratio_topic}
                         
    return make_response(jsonify(response))

def load_topic_preference():
    ratio_topic = [[[1.0 for i in range(topic_n)] for j in range(5)] for k in range(4)]
    part_list = ["Drums", "Bass", "Synth", "Sequence"]
    for i in range(4):
        for j in range(5):
            topic = read_file('./lda/' + part_list[i] + '/ratio_topic' + str(j) + '.txt')
            #pass_ratio_topic = './lda/' + part_list[i] + '/ratio_topic' + str(j) + '.txt'
            #topic = []
            #with open(pass_ratio_topic) as f:
            #    topic = f.read().split("\n")
            for k in range(4):
                ratio_topic[i][j][k] = float(topic[k])
            print(ratio_topic[i][j][0:])

    return ratio_topic
    
def createMusic(array, projectid, fix, structure):
    """楽曲の生成"""
    #盛り上がり度を求める
    #self.excitement_array = self.model.chengeExcitement(array)
    #状態を求める
    no_part_hmm_model, intro_hmm_model, breakdown_hmm_model, buildup_hmm_model, drop_hmm_model, outro_hmm_model = initialize_Hmm()
    hmm_array = ""
    section_array = ""
    if structure == 0:
        hmm_array = use_HMM(array, no_part_hmm_model)
    else:
        hmm_array, section_array = use_Auto_HMM(array, intro_hmm_model, breakdown_hmm_model, buildup_hmm_model, drop_hmm_model, outro_hmm_model)
    if fix == 1:
        if structure == 0:
            hmm_array,array = fix_Hmm(hmm_array,array)
        else:
            section_array = dtw(array)
            hmm_array,array = fix_Auto_Hmm(hmm_array,array,section_array)
    print("Section array↓")
    print(hmm_array, section_array)
    print("Section array↑")

    #音素材を繋げる
    sound_list = choose_sound(array, hmm_array)
    #コードを付与する
    sound_list = give_chord(sound_list)
    #音素材を繋げる
    songid = connect_sound(sound_list, projectid, "create", None)
    
    return sound_list, songid, section_array   
        
def use_HMM(excitement_array, no_part_hmm_model):
    """HMMを使用する"""
    observation_data = np.atleast_2d(excitement_array).T
    hmm_array,hmm_array = no_part_hmm_model.decode(observation_data)
    print("observation_data")
    return hmm_array 
        
def use_Auto_HMM(excitement_array, intro_hmm_model, breakdown_hmm_model, buildup_hmm_model, drop_hmm_model, outro_hmm_model):
    """構成を考慮したHMMを使用する"""
    section_array = dtw(excitement_array)
    #パート毎にリストを用意する
    intro_array, breakdown_array, buildup_array, drop_array, outro_array = list(), list(), list(), list(), list()
    
    for i,e in enumerate(excitement_array):
        if section_array[i] == 0:
            intro_array.append(e)
        elif section_array[i]==1:
            breakdown_array.append(e)
        elif section_array[i]==2:
            buildup_array.append(e)
        elif section_array[i]==3:
            drop_array.append(e)
        elif section_array[i]==4:
            outro_array.append(e)
        
    #intro
    intro_data = np.atleast_2d(intro_array).T
    intro_hmm_array,intro_hmm_array = intro_hmm_model.decode(intro_data)
    #breakdown
    breakdown_data = np.atleast_2d(breakdown_array).T
    breakdown_hmm_array,breakdown_hmm_array = breakdown_hmm_model.decode(breakdown_data)
    # buildup
    buildup_data = np.atleast_2d(buildup_array).T
    buildup_hmm_array,buildup_hmm_array = buildup_hmm_model.decode(buildup_data)
    # drop
    drop_data = np.atleast_2d(drop_array).T
    drop_hmm_array,drop_hmm_array = drop_hmm_model.decode(drop_data)
    # outro
    outro_data = np.atleast_2d(outro_array).T
    outro_hmm_array,outro_hmm_array = outro_hmm_model.decode(outro_data)
    temp = np.concatenate([intro_hmm_array,breakdown_hmm_array, buildup_hmm_array, drop_hmm_array ,outro_hmm_array])


    return (np.concatenate([intro_hmm_array,breakdown_hmm_array, buildup_hmm_array, drop_hmm_array ,outro_hmm_array]), section_array)
        
        
        
def dtw(excitement_array):
    """DTWの計算を行う"""
    #セクションは4小節ごとに考慮する
    short_excitement_array = list()
    sum = 0
    for i,e in enumerate(excitement_array,1):
        if i % 4 == 0 and i != 0:
            short_excitement_array.append(round(sum/4))
            sum=0
        sum += e
    excitement_array = short_excitement_array                
    #セクションが取るであろう盛り上がり度
    #intro, breakdown + buildup, drop, outro
    section_excitement = [0, 1, 3.3, 0]
    #2つの時系列の長さ
    excitement_len = len(excitement_array)
    section_len = len(section_excitement)
    #初期化
    dtw = calc_dtw(excitement_len, section_len,excitement_array,section_excitement)
    #セクションを決定する
    section_array = list()
    #逆から考える
    dtw = dtw[::-1]
    #outroで終わるように調整
    for i in range(4):
        section_array.append(4)
    #最小値を見ながらセクションを決定する
    for d in dtw[1:]:
        #見る範囲
        start = section_array[-1]-1
        end = section_array[-1]+1       
        section = d.index(min(d[start:end]))
        for i in range(4):
            section_array.append(section)
    #もとに戻す
    section_array = restore_section_array(section_array)
    return (section_array)

def calc_dtw(excitement_len, section_len,excitement_array,section_excitement):
    dtw = [[float("inf") for i in range(section_len+1)] for j in range(excitement_len + 1)]
    dtw[0][0] = 0
    #累積を考える
    for i in range(1,excitement_len+1):
        for j in range(1,section_len+1):
            cost = abs(excitement_array[i-1]-section_excitement[j-1])
            dtw[i][j] = cost + min(dtw[i-1][j-1],
            dtw[i-1][j])       
    return dtw

def restore_section_array(section_array):
    section_array = section_array[::-1]
    section_array = section_array[4:]
    section_array = [s-1 for s in section_array]
    for i in range(len(section_array)):
        if section_array[i] == 2 or section_array[i]==3:
            section_array[i]+=1
    buildup_start = section_array.index(3)-2
    buildup_end = section_array.index(3)
    section_array[buildup_start:buildup_end] = [2,2]
    return (section_array)
        
def fix_Hmm(hmm_array,excitement_array):
    """小節毎に揃える"""
    for i in range(len(hmm_array)):
        if i % fix_len == 0:
            h = hmm_array[i]
            e = excitement_array[i]
        hmm_array[i] = h
        excitement_array[i] = e
    return hmm_array,excitement_array
        
def fix_Auto_Hmm(hmm_array,excitement_array,section_array):
    """セクションに合わせて揃える"""
    pre_section = -1
    for i in range(len(hmm_array)):
        if pre_section != section_array[i] or i % fix_len == 0:
            h = hmm_array[i]
            e = excitement_array[i]
        hmm_array[i]=h
        excitement_array[i] = e
        pre_section = section_array[i]

    return hmm_array,excitement_array
        
def choose_sound(excitement_array,hmm_array):
    """使用する音素材を選択する"""
    sound_list = list()
    for i in range(excitement_len):
        binary = format(hmm_array[i], 'b').zfill(4)
        binary = binary[::-1]
        excitement = excitement_array[i]
        if i % fix_len == 0 : 
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

    ratio_topic = load_topic_preference()
    part_name_list = ["Drums", "Bass", "Synth", "Sequence"]
            

    # drums_part
    drums_list = choose_sound_randomly_with_using_ratio_topic(part_name_list[0], 0, drums_list, ratio_topic)
    
    # bass_part
    bass_list = choose_sound_randomly_with_using_ratio_topic(part_name_list[1], 1, bass_list, ratio_topic)

    #synth_part
    synth_list = choose_sound_randomly_with_using_ratio_topic(part_name_list[2], 2, synth_list, ratio_topic)
    
    #sequence_part
    sequence_list = choose_sound_randomly_with_using_ratio_topic(part_name_list[3], 3, sequence_list, ratio_topic)
        
    
    random_sound_list.append(drums_list)
    random_sound_list.append(bass_list)
    random_sound_list.append(synth_list)
    random_sound_list.append(sequence_list)

    return random_sound_list

def choose_sound_randomly_with_using_ratio_topic(part_name, part_id, part_sound_list, ratio_topic):
    for i in range(5):
        df = read_from_csv('./lda/' + part_name + '/lda' + str(i) + '.csv')
        
        feature_names = df.index.values
        part_sound_name_list = []
        for j in range(len(feature_names)):
            part_name_list = "./TechnoTrance/" + part_name + "/" + str(i) + "/" + feature_names[j] + ".wav"
            part_sound_name_list.append(part_name_list)
        #print(part_name_list)
        #print(feature_names)
        calcs1 = []
        sum1 = 0
        for j in range(len(feature_names)):
            topics = np.array(df[j:j+1])[0][0:]
            calc = 0
            for k in range(len(topics)-1):
                calc += ratio_topic[part_id][i][k] * topics[k]
            calcs1.append(calc)
            sum1 += calc
        #print(sum1)
        sumex = 0
        #print(calcs1)
        for j in range(len(feature_names)):
            calcs1[j] = calcs1[j]/sum1
            sumex += calcs1[j]
        #print(calcs1)
        #print(sumex)

        #print(part_name_list)
        print("OK")
        #print(calcs1)
        
        selected_word = np.random.choice(part_sound_name_list, p=calcs1)
        #print(selected_word)
        print("OKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOKOK")
        part_sound_list.append(selected_word)
    return part_sound_list

def read_from_csv(path):
    df = pd.read_csv(path, header=0,index_col=0)

    return df
# def choose_sound_randomly():
#     """音素材をランダムに選択する"""
#     random_sound_list = list()
#     drums_list = list()
#     bass_list = list()
#     synth_list = list()
#     sequence_list = list()

#     for i in range(5):
#         drums_file = os.listdir("./TechnoTrance/Drums/"+str(i))
#         drums_list.append("./TechnoTrance/Drums/"+ str(i) + "/" +  random.choice(drums_file))

#         bass_file = os.listdir("./TechnoTrance/Bass/"+str(i))
#         bass_list.append("./TechnoTrance/Bass/"+ str(i) + "/" +  random.choice(bass_file))

#         synth_file = os.listdir("./TechnoTrance/Synth/"+str(i))
#         synth_list.append("./TechnoTrance/Synth/"+ str(i) + "/" +  random.choice(synth_file))

#         sequence_file = os.listdir("./TechnoTrance/Sequence/"+str(i))
#         sequence_list.append("./TechnoTrance/Sequence/"+ str(i) + "/" +  random.choice(sequence_file))

#     random_sound_list.append(drums_list)
#     random_sound_list.append(bass_list)
#     random_sound_list.append(synth_list)
#     random_sound_list.append(sequence_list)

#     return random_sound_list
        
def give_chord(sound_list):
    """コードを付与"""
    chord = ["2", "5", "3", "6", "4", "6", "7", "1"]
    for i,sound in enumerate(sound_list,0):
        for part in range(1,4):
            sound[part] = re.sub('[0-9].wav',chord[i%8]+".wav",sound[part])
              
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
           
    # 楽曲を更新する
    songid = connect_new_song(projectid, output_sound, mode, songid)
    #created = False
    #while created == False:
    #    if os.path.exists("./project/" + projectid + "/songs/"+ str(songid)) == False:
    #        os.mkdir("./project/" + projectid + "/songs/"+ str(songid))
    #        output_sound.export("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".wav", format="wav")
    #        created = True
            #sound = AudioSegment.from_wav("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".wav")
            #sound.export("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".mp3", format="mp3")
    #    else:
    #        songid = songid + 1
        
    return str(songid)

def connect_new_song(projectid, output_sound, mode, songid):
    if mode == 'create':
        songid = 0
        created = False
        while created == False:
            if os.path.exists("./project/" + projectid + "/songs/"+ str(songid)) == False:
                os.mkdir("./project/" + projectid + "/songs/"+ str(songid))
                output_sound.export("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".wav", format="wav")
                created = True
                #sound = AudioSegment.from_wav("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".wav")
                #sound.export("./project/" + projectid + "/songs/" + str(songid) + "/song" + str(songid) + ".mp3", format="mp3")
            else:
                songid = songid + 1
    else:
        output_sound.export("./project/" + projectid + "/songs/" + songid + "/song" + str(songid) + ".wav", format="wav")
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
    emissprob = np.array([[0, 0, 0, 0, 0], [0.4, 0.2, 0.2, 0.1, 0.1],
                          [0.39, 0.21, 0.2, 0.1, 0.1], [0.25, 0.3, 0.25, 0.1, 0.1],
                          [0.39, 0.21, 0.2, 0.1, 0.1], [0.25, 0.3, 0.25, 0.1, 0.1],
                          [0.25, 0.3, 0.25, 0.1, 0.1], [0.15, 0.2, 0.3, 0.2, 0.15],
                          [0.35, 0.25, 0.2, 0.1, 0.1], [0.2, 0.2, 0.3, 0.1, 0.1],
                          [0.2, 0.2, 0.35, 0.15, 0.1], [0.1, 0.1, 0.2, 0.25, 0.35],
                          [0.2, 0.2, 0.35, 0.15, 0.1], [0.1, 0.1, 0.2, 0.25, 0.35],
                          [0.1, 0.1, 0.2, 0.25, 0.35], [0.05, 0.05, 0.25, 0.25, 0.4]])
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
    return no_part_hmm_model, intro_hmm_model, breakdown_hmm_model, buildup_hmm_model, drop_hmm_model, outro_hmm_model
        
def get_no_part_hmm_model(emissprob):
    no_part_startprob = np.array([0, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666,
                          0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666])
    no_part_transmat = np.array(
        [[0, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666, 0.06666666666]] * 16)
    no_part_hmm_model = hmm.MultinomialHMM(n_components=16)
    no_part_hmm_model.startprob_ = no_part_startprob
    no_part_hmm_model.transmat_ = no_part_transmat
    no_part_hmm_model.n_features = 5
    no_part_hmm_model.emissionprob_ = emissprob
    return no_part_hmm_model

def get_intro_hmm_model(emissprob):
    intro_startprob = np.array(
        [0,
         0.1,
         0.8/13,
         0.1,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13,
         0.8/13
         ]
    )
    intro_transmat = np.array(
        [
            intro_startprob
        ] * 16)

    intro_hmm_model = hmm.MultinomialHMM(n_components=16)
    intro_hmm_model.startprob_ = intro_startprob
    intro_hmm_model.transmat_ = intro_transmat
    intro_hmm_model.n_features = 5
    intro_hmm_model.emissionprob_ = emissprob

    return intro_hmm_model

def get_breakdown_hmm_model(emissprob):
    breakdown_startprob = np.array(
        [0,
         0.7/12,
         0.7/12,
         0.1,
         0.7/12,
         0.7/12,
         0.15,
         0.7/12,
         0.7/12,
         0.7/12,
         0.7/12,
         0.7/12,
         0.7/12,
         0.7/12,
         0.05,
         0.7/12
         ]
    )

    breakdown_transmat = np.array(
        [
            breakdown_startprob
        ] * 16)

    breakdown_hmm_model = hmm.MultinomialHMM(n_components=16)
    breakdown_hmm_model.startprob_ = breakdown_startprob
    breakdown_hmm_model.transmat_ = breakdown_transmat
    breakdown_hmm_model.n_features = 5
    breakdown_hmm_model.emissionprob_ = emissprob
    return breakdown_hmm_model

def get_buildup_hmm_model(emissprob):
    buildup_startprob = np.array(
        [0,
         0.7/13,
         0.7/13,
         0.1,
         0.7/13,
         0.7/13,
         0.7/13,
         0.2,
         0.7/13,
         0.7/13,
         0.7/13,
         0.7/13,
         0.7/13,
         0.7/13,
         0.7/13,
         0.7/13
         ]
    )
    buildup_transmat = np.array(
        [
            buildup_startprob
        ] * 16)

    buildup_hmm_model = hmm.MultinomialHMM(n_components=16)
    buildup_hmm_model.startprob_ = buildup_startprob
    buildup_hmm_model.transmat_ = buildup_transmat
    buildup_hmm_model.n_features = 5
    buildup_hmm_model.emissionprob_ = emissprob
    return buildup_hmm_model

def get_drop_hmm_model(emissprob):
    drop_startprob = np.array(
        [0,
         0.4/12,
         0.4/12,
         0.4/12,
         0.4/12,
         0.4/12,
         0.4/12,
         0.4/12,
         0.4/12,
         0.4/12,
         0.4/12,
         0.1,
         0.4/12,
         0.4/12,
         0.2,
         0.3
         ]
    )
    drop_transmat = np.array(
        [
            drop_startprob

        ] * 16)

    drop_hmm_model = hmm.MultinomialHMM(n_components=16)
    drop_hmm_model.startprob_ = drop_startprob
    drop_hmm_model.transmat_ = drop_transmat
    drop_hmm_model.n_features = 5
    drop_hmm_model.emissionprob_ = emissprob
    return drop_hmm_model

def get_outro_hmm_model(emissprob):
    outro_startprob = np.array(
        [0,
         0.6/12,
         0.6/12,
         0.6/12,
         0.1,
         0.6/12,
         0.6/12,
         0.6/12,
         0.15,
         0.6/12,
         0.6/12,
         0.6/12,
         0.15,
         0.6/12,
         0.6/12,
         0.6/12
         ]
    )
    outro_transmat = np.array(
        [
            outro_startprob
        ] * 16)

    outro_hmm_model = hmm.MultinomialHMM(n_components=16)
    outro_hmm_model.startprob_ = outro_startprob
    outro_hmm_model.transmat_ = outro_transmat
    outro_hmm_model.n_features = 5
    outro_hmm_model.emissionprob_ = emissprob
    return outro_hmm_model

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)

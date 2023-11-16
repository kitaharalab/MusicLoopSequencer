import firebase_admin
import pandas as pd
from firebase_admin import credentials
from flask import Flask
from flask_cors import CORS
from route.music_parts import parts
from route.music_parts.id.sounds import sounds
from route.music_parts.id.sounds.id import sound_id
from route.projects import projects
from route.projects.songs import songs
from route.projects.songs.music_parts import song_parts
from route.projects.songs.music_parts.measure import part_measure
from route.projects.songs.music_parts.measure.music_loop import mesure_music_loop
from route.topic import topic

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
app.register_blueprint(song_parts)
app.register_blueprint(part_measure)
app.register_blueprint(mesure_music_loop)
app.register_blueprint(topic)

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

# def load_music_data(path):
#     data_list = read_file(path)

#     measure_number = 0
#     sound_array = [["null" for i in range(4)] for j in range(32)]

#     for i in range(len(data_list)):
#         if data_list[i] != "null":
#             sound_array[measure_number][i % 4] = int(data_list[i])
#         else:
#             sound_array[measure_number][i % 4] = None
#         if i % 4 == 3:
#             measure_number += 1


# def save_music_data(
#     projectid,
#     songid,
#     sound_array,
#     drums_list,
#     bass_list,
#     synth_list,
#     sequence_list,
#     user_id,
# ):
#     for i in range(len(sound_array)):
#         for j in range(len(sound_array[0])):
#             if j == 0:
#                 for k in range(len(drums_list)):
#                     if sound_array[i][j] == drums_list[k]:
#                         sound_array[i][j] = str(k)
#             elif j == 1:
#                 for k in range(len(bass_list)):
#                     if sound_array[i][j] == bass_list[k]:
#                         sound_array[i][j] = str(k)
#             elif j == 2:
#                 for k in range(len(synth_list)):
#                     if sound_array[i][j] == synth_list[k]:
#                         sound_array[i][j] = str(k)
#             else:
#                 for k in range(len(sequence_list)):
#                     if sound_array[i][j] == sequence_list[k]:
#                         sound_array[i][j] = str(k)

#     add_song(sound_array_wrap(sound_array), songid, user_id)


"""@app.route("/projects/<projectid>/songs/<songid>/<filename>", methods=['GET'])
def downloadSong(projectid,songid,filename):
    filepath = "./project/" + projectid + "/songs/" + songid + "/" + filename
    response = make_response(filepath)
    response.headers['Content-Type'] = 'audio/wav'
    response.headers['Content-Disposition'] = 'attachment; filename=' + filename
    return response"""


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


def read_from_csv(path):
    df = pd.read_csv(path, header=0, index_col=0)

    return df


# INFO: OLD, パス名から実際の音声データを取ってくるときの処理
# def give_chord(sound_list):
#     """コードを付与"""
#     chord = ["2", "5", "3", "6", "4", "6", "7", "1"]
#     for i, sound in enumerate(sound_list, 0):
#         for part in range(1, 4):
#             sound[part] = re.sub("[0-9].wav", chord[i % 8] + ".wav", sound[part])

#     return sound_list


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

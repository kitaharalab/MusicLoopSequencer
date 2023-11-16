from util.topic import update_topic_ratio


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

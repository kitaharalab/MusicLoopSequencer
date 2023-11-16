from readFiles import readLoopsPath

PARTS = ["Drums", "Bass", "Synth", "Sequence"]


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


# TODO: 多分array[i][j]にidを追加しそうなのでいらなくなる？
# TODO: 名前の部分から修正する必要がある
def name_to_id(array):
    part_list = [readLoopsPath(part) for part in PARTS]
    for i in range(len(array)):
        for j in range(len(array[0])):
            for k in range(len(part_list[j])):
                if array[i][j] == part_list[j][k]:
                    array[i][j] = str(k)

    return array

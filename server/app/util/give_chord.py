from sqls import get_loop_id_from_id_chord, get_loop_id_from_id_chord
from util.const import CHORD_BY_MEASURE


def give_chord(sound_list: list[list[int]]):
    """コードを付与"""
    chorded_sound_id_list: list[list[int]] = []
    for i, sound in enumerate(sound_list, 0):
        chorded_sound_id_list.append([sound[0]])
        for part in range(1, 4):
            if sound[part] is None or sound[part] == "null":
                chorded_sound_id_list[-1].append(None)
                continue

            chorded_loop_id = get_loop_id_from_id_chord(
                int(sound[part]), CHORD_BY_MEASURE[i % len(CHORD_BY_MEASURE)]
            )
            chorded_sound_id_list[-1].append(chorded_loop_id)

    return chorded_sound_id_list


def get_chorded_loop_id(loop_id: int, measure: int):
    return get_loop_id_from_id_chord(
        loop_id, CHORD_BY_MEASURE[measure % len(CHORD_BY_MEASURE)]
    )

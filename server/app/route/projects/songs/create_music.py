from hmm_model.model import initialize_Hmm
from util.connect_sound import connect_sound
from util.const import fix_len
from util.dtw import dtw
from util.hmm import fix_Auto_Hmm, fix_Hmm, use_Auto_HMM, use_HMM

from .choose_sound import choose_sound

from sqls import get_loop_id_from_id_chord


# TODO: returnしてるsongIdは使ってないので修正
def createMusic(array, projectid, user_id, structure=1, fix=0):
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
    if structure == 0:
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
    if fix == 1:
        if structure == 0:
            hmm_array, array = fix_Hmm(hmm_array, array, fix_len)
        else:
            section_array = dtw(array)
            hmm_array, array = fix_Auto_Hmm(hmm_array, array, section_array, fix_len)
    # 音素材を繋げる
    sound_list_by_mesure_part = choose_sound(array, hmm_array, user_id)
    # コードを付与する
    chorded_sound_id_list = give_chord(sound_list_by_mesure_part)
    # 音素材を繋げる
    songid, wav_data_bytes = connect_sound(
        chorded_sound_id_list, projectid, "create", None
    )

    return chorded_sound_id_list, songid, section_array, wav_data_bytes


def give_chord(sound_list):
    """コードを付与"""
    chorded_sound_id_list: list[list[int]] = []
    chord = [2, 5, 3, 6, 4, 6, 7, 1]
    for i, sound in enumerate(sound_list, 0):
        chorded_sound_id_list.append([sound[0]])
        for part in range(1, 4):
            if sound[part] is None or sound[part] == "null":
                chorded_sound_id_list[-1].append(None)
                continue

            chorded_loop_id = get_loop_id_from_id_chord(
                int(sound[part]), chord[i % len(chord)]
            )
            chorded_sound_id_list[-1].append(chorded_loop_id)

    return chorded_sound_id_list

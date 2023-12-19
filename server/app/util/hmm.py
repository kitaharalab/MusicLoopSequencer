import numpy as np
from util.dtw import dtw


def fix_Hmm(hmm_array, excitement_array, fix_len):
    """小節毎に揃える"""
    for i in range(len(hmm_array)):
        if i % fix_len == 0:
            h = hmm_array[i]
            e = excitement_array[i]
        hmm_array[i] = h
        excitement_array[i] = e
    return hmm_array, excitement_array


def fix_Auto_Hmm(hmm_array, excitement_array, section_array, fix_len):
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

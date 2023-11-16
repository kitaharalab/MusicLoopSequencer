import numpy as np
from hmmlearn import hmm


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

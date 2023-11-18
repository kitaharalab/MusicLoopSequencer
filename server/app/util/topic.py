import pprint
import re
from asyncore import loop
from pprint import pprint

import numpy as np
import pandas as pd
from sqls import (
    get_loop_topics,
    get_topic_id_ns,
    get_topic_preferences_from_part_excitement,
    update_topic_preferences_from_topic_preferences,
)


def update_topic_ratio(sound_array, measureid, partid, loop_id, user_id, topic_n=4):
    # # print("ここまでは大丈夫")
    # # TODO: partidをむりやり変更，現在のIDから1を引けば同じになるという前提．measureIDも同様
    # split_name = re.split("/|\.", str(sound_array[int(measureid)][int(partid) - 1]))
    # # part_list = ["Drums", "Bass", "Synth", "Sequence"]
    # pass_ratio_topic = f"./lda/{split_name[3]}/ratio_topic{split_name[4]}.txt"
    # # TODO: 変更先の音素材の盛り上がり度とpartidとトピック数から，topic選好度を取得したい
    # ratio_topic = read_file(pass_ratio_topic)

    # for i in range(len(ratio_topic)):
    #     ratio_topic[i] = float(ratio_topic[i])
    # # TODO: 音素材のpart name, その盛り上がり度
    # df = pd.read_csv(
    #     "./lda/" + split_name[3] + "/lda" + split_name[4] + ".csv",
    #     header=0,
    #     index_col=0,
    # )
    # feature_names = df.index.values
    # n = 0

    # for i in range(len(feature_names)):
    #     if feature_names[i] == split_name[5]:
    #         n = i
    # topic_array = np.array(df[n : n + 1])[0][0:]
    # TODO: partと盛り上がり度から出てくるトピック選好度を，全てのトピックにおいて足す
    topic_id_ns = get_topic_id_ns()
    topic_n_ids = list(
        map(lambda x: x["id"], filter(lambda x: x["number"] == topic_n, topic_id_ns))
    )

    topic_preferences = get_topic_preferences_from_part_excitement(user_id, partid, 0)
    loop_info = get_loop_topics(loop_id)

    topic_n_preferences = list(
        filter(lambda x: x["topic_id"] in topic_n_ids, topic_preferences)
    )
    topic_n_preferences = sorted(topic_n_preferences, key=lambda x: x["topic_id"])

    loop_n_info = list(filter(lambda x: x["topic_id"] in topic_n_ids, loop_info))
    loop_n_info = sorted(loop_n_info, key=lambda x: x["topic_id"])

    for topic_number in range(topic_n):
        topic_n_preferences[topic_number]["value"] += loop_n_info[topic_number]["value"]
    update_topic_preferences_from_topic_preferences(user_id, topic_n_preferences)

    # for i in range(topic_n):
    #     ratio_topic[i] += topic_array[i]

    # # TODO: topic選好度をデータベースに入れる
    # with open(pass_ratio_topic, mode="w") as f:
    #     for k in range(4):
    #         # print(k)
    #         if k == 0:
    #             f.write(str(ratio_topic[k]))
    #         else:
    #             f.write("\n" + str(ratio_topic[k]))


def read_file(path):
    data_list = []
    with open(path) as f:
        data_list = f.read().split("\n")

    return data_list

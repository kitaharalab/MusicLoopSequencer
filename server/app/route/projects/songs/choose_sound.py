import numpy as np
from sqls import (
    get_loop_and_topics_from_part,
    get_parts,
    get_topic_id_ns,
    get_topic_preferences,
)
from util.const import excitement_len, fix_len, topic_n
from cache import cache

part_name2index = {"Drums": 0, "Bass": 1, "Synth": 2, "Sequence": 3}


def choose_sound(excitement_array, hmm_array, user_id):
    """使用する音素材を選択する"""
    sound_list = list()
    for i in range(excitement_len):
        binary = format(hmm_array[i], "b").zfill(4)
        binary = binary[::-1]
        excitement = excitement_array[i]
        if i % fix_len == 0:
            random_sound_list_by_part_excitement = choose_sound_randomly(user_id)
        block_sound = list()
        for part in range(4):
            if binary[part] == "1":
                block_sound.append(
                    random_sound_list_by_part_excitement[part][excitement]
                )
            else:
                block_sound.append(None)
        sound_list.append(block_sound)

    return sound_list


@cache.memoize()
def get_topic_preferences_by_topic_n(user_id):
    topic_id_ns = get_topic_id_ns()
    topic_n_ids = list(
        map(lambda x: x["id"], filter(lambda x: x["number"] == topic_n, topic_id_ns))
    )

    topic_preferences = get_topic_preferences(user_id)
    topic_n_preferences = list(
        filter(lambda x: x["topic_id"] in topic_n_ids, topic_preferences)
    )

    topic_n_preferences_by_part_measure_topic = dict()

    for topic_n_preference in topic_n_preferences:
        part_id = topic_n_preference["part_id"]
        topic_id = topic_n_preference["topic_id"]
        excitement = topic_n_preference["excitement"]
        value = topic_n_preference["value"]

        topic_n_preferences_by_part_measure_topic.setdefault(
            part_id, dict()
        ).setdefault(excitement, dict())[topic_id] = value

    return topic_n_preferences_by_part_measure_topic


# TODO: 音素材のファイル名とwavデータとidをデータベースから取得したい
def choose_sound_randomly(user_id):
    """音素材をランダムに選択する"""
    random_sound_list = list()
    topic_n_preferences_by_part_measure_topic = get_topic_preferences_by_topic_n(
        user_id
    )

    parts = get_parts()
    parts = sorted(parts, key=lambda x: part_name2index[x["name"]])

    random_sound_list = []
    for part in parts:
        sound_list = choose_sound_randomly_with_using_ratio_topic(
            part["id"],
            topic_n_preferences_by_part_measure_topic[part["id"]],
        )
        random_sound_list.append(sound_list)

    return random_sound_list


@cache.memoize()
def get_part_loop_values(part_id):
    topic_id_ns = get_topic_id_ns()
    topic_n_ids = list(
        map(lambda x: x["id"], filter(lambda x: x["number"] == topic_n, topic_id_ns))
    )
    # このパートの盛り上がり度ごとの音素材のIDとトピックが欲しい
    all_loop_and_topics = get_loop_and_topics_from_part(part_id)
    all_n_loop_and_topics = list(
        filter(lambda x: x["topic_id"] in topic_n_ids, all_loop_and_topics)
    )
    # pprint.pprint(all_loop_and_topics)
    topic_value_by_excitement_loop_topic: dict[int, dict[int, dict]] = dict()

    for topic_value_by_topic in all_n_loop_and_topics:
        excitement = topic_value_by_topic["excitement"]
        loop_id = topic_value_by_topic["id"]
        topic_id = topic_value_by_topic["topic_id"]
        value = topic_value_by_topic["value"]
        if excitement not in topic_value_by_excitement_loop_topic:
            topic_value_by_excitement_loop_topic[excitement] = dict()
        if loop_id not in topic_value_by_excitement_loop_topic[excitement]:
            topic_value_by_excitement_loop_topic[excitement][loop_id] = dict()
        topic_value_by_excitement_loop_topic[excitement][loop_id][topic_id] = value

    return topic_value_by_excitement_loop_topic


# TODO: 音素材のトピックと，トピック選好度を使ってるらしい
def choose_sound_randomly_with_using_ratio_topic(
    part_id, topic_n_preferences_by_excitement_topic
):
    topic_value_by_excitement_loop_topic = get_part_loop_values(part_id)

    random_loop_by_excitement = []
    for (
        excitement_value,
        topic_value_by_loop_topic,
    ) in topic_value_by_excitement_loop_topic.items():
        loops_order = []
        loop_topics_sums = []
        for loop_id, topic_value_by_topic in topic_value_by_loop_topic.items():
            loops_order.append(loop_id)
            loop_topics_sum = 0
            for topic_id, value in topic_value_by_topic.items():
                # loop_topics_sum += topic_n_preferences_by_topic[excitement_value][topic_id] * value
                loop_topics_sum += (
                    topic_n_preferences_by_excitement_topic[excitement_value][topic_id]
                    * value
                )
            loop_topics_sums.append(loop_topics_sum)

        topics_sum = sum(loop_topics_sums)
        loop_topics_probability = [
            loop_topics_sum / topics_sum for loop_topics_sum in loop_topics_sums
        ]
        random_loop_id = np.random.choice(loops_order, p=loop_topics_probability)
        random_loop_by_excitement.append(random_loop_id)

    return random_loop_by_excitement

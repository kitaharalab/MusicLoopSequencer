from sqls import (
    get_loop_topics,
    get_topic_id_ns,
    get_topic_preferences_from_part_excitement,
    update_topic_preferences_from_topic_preferences,
)


def update_topic_ratio(partid, loop_id, user_id, topic_n=4):
    # INFO: partと盛り上がり度から出てくるトピック選好度を，全てのトピックにおいて足す
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


def read_file(path):
    data_list = []
    with open(path) as f:
        data_list = f.read().split("\n")

    return data_list

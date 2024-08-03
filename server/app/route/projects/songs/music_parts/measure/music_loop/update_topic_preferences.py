from sqls import (
    get_loop_info_topics,
    get_topic_id_ns,
    get_topic_preferences_from_part_excitement,
    update_topic_preferences_from_topic_preferences,
)
from util.const import topic_n

from .get_updated_topic_preferences import get_updated_topic_preferences


def update_topic_preferences(user_id, loop_id):
    updated_topic_preferences, _, part_id, excitement = get_updated_topic_preferences(user_id, loop_id)
    topic_id_ns = get_topic_id_ns()
    topic_n_ids = list(
        map(lambda x: x["id"], filter(lambda x: x["number"] == topic_n, topic_id_ns))
    )

    loop_info = get_loop_info_topics(loop_id)
    topic_preferences = get_topic_preferences_from_part_excitement(
        user_id, part_id, excitement
    )

    topic_n_preferences = list(
        filter(lambda x: x["topic_id"] in topic_n_ids, topic_preferences)
    )
    topic_n_preferences = sorted(topic_n_preferences, key=lambda x: x["topic_id"])

    loop_n_info = list(filter(lambda x: x["topic_id"] in topic_n_ids, loop_info))
    loop_n_info = sorted(loop_n_info, key=lambda x: x["topic_id"])

    for topic_i in range(topic_n):
        topic_n_preferences[topic_i]["value"] = updated_topic_preferences[topic_i]
    update_topic_preferences_from_topic_preferences(user_id, topic_n_preferences)
from sqls import get_parts
from sqls.topics import get_topic_with_excitement, get_topics
from util.const import EXCITEMENT_VALUE_MAX


def get_default_topic_preference_value(curve_excitement: int, topic_excitement: int):
    if not curve_excitement or not topic_excitement:
        return 1

    same_excitement = curve_excitement == topic_excitement
    if same_excitement:
        return 4

    near_excitement = abs(curve_excitement - topic_excitement) == 1
    if near_excitement:
        return 2

    return 0


def get_default_topic_preferences(firebase_id: str):
    """

    Args:
        firebase_id (str): _description_

    Returns:
        firebase_id, part_id, curve_excitement, topic_id, value
    """
    # topics_with_excitement = get_topic_with_excitement()
    topics = get_topics()
    parts = get_parts()
    insert_topic_preferences = []
    for curve_excitement in range(EXCITEMENT_VALUE_MAX):
        for part in parts:
            # for topic in topics_with_excitement:
            for topic in topics:
                default_value = get_default_topic_preference_value(
                    curve_excitement, topic.get("excitement")
                )

                insert_topic_preferences.append(
                    (
                        firebase_id,
                        part["id"],
                        curve_excitement,
                        topic["id"],
                        default_value,
                    )
                )

    return insert_topic_preferences

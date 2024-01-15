from sqls.topics import get_topic_with_excitement, get_topics

from .get import get_topic_preferences_tuple
from .util import get_default_topic_preferences


def make_exists_topic_preferences(firebase_id: str):
    # topics = get_topic_with_excitement()
    topics = get_topics()
    topic_ids = tuple(map(lambda x: x["id"], topics))
    sql = """
        SELECT
            EXISTS (
                SELECT
                    *
                FROM
                    topic_preferences
                WHERE
                    user_id = %s
                    AND topic_id IN %s
            );
    """
    return (sql, (firebase_id, topic_ids))


def make_insert_topic_preferences(firebase_id: str):
    default_topic_preferences = get_default_topic_preferences(firebase_id)
    current_topic_preferences = get_topic_preferences_tuple(firebase_id)

    # DBに入っていないトピック選考度のデータを探す
    insert_topic_preferences = []
    if current_topic_preferences:
        no_value_current_topic_preferences = set(
            [ctp[:-1] for ctp in current_topic_preferences]
        )
        for tp in default_topic_preferences:
            if tp[:-1] not in no_value_current_topic_preferences:
                insert_topic_preferences.append(tp)
    else:
        insert_topic_preferences = default_topic_preferences

    sql = """
        INSERT INTO
            topic_preferences (user_id, part_id, excitement, topic_id, VALUE)
        VALUES %s
    """
    return (sql, insert_topic_preferences)

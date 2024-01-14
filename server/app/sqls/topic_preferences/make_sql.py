from sqls.topics import get_topic_with_excitement

from .util import get_default_topic_preferences


def make_exists_topic_preferences(firebase_id: str):
    topics = get_topic_with_excitement()
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
    print(default_topic_preferences)
    sql = """
        INSERT INTO
            topic_preferences (user_id, part_id, excitement, topic_id, VALUE)
        VALUES %s
    """
    return (sql, default_topic_preferences)

from cache import cache
from psycopg2.extras import DictCursor

from .connection import get_connection
from .part import get_parts


@cache.memoize()
def get_topic_id_ns():
    select_sql = """
        SELECT
            id,
            number
        FROM
            topics
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(select_sql)
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response


@cache.memoize()
def get_topic_preferences(user_id: str):
    select_sql = """
        SELECT
            topic_id,
            part_id,
            excitement,
            value
        FROM
            topic_preferences
        WHERE
            user_id = %s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(select_sql, (user_id,))
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response if len(response) > 0 else None


def get_topic_preferences_by_part_topic_id(user_id: str):
    topic_preferences = get_topic_preferences(user_id)
    response = dict()

    for topic_preferences in topic_preferences:
        topic_id = topic_preferences["topic_id"]
        part_id = topic_preferences["part_id"]
        value = topic_preferences["value"]
        if part_id not in response:
            response[part_id] = dict()
        response[part_id][topic_id] = value

    return response


def add_topic_preferences(user_id: str):
    insert_sql = """
        INSERT INTO topic_preferences (user_id, topic_id, part_id, excitement)
        values (%s, %s, %s, %s)
    """
    parts = get_parts()
    topic_id_ns = get_topic_id_ns()
    with get_connection() as conn:
        with conn.cursor() as cur:
            for part in parts:
                for topic_id_n in topic_id_ns:
                    for excitement in range(5):
                        cur.execute(
                            insert_sql,
                            (user_id, topic_id_n["id"], part["id"], excitement),
                        )
            conn.commit()


def get_topic_preferences_from_part_excitement(
    user_id: int, part_id: int, excitement: int
):
    topic_preferences = get_topic_preferences(user_id)
    if topic_preferences is None:
        return None

    filtered_topic_preferences = list(
        filter(
            lambda x: x["part_id"] == part_id and x["excitement"] == excitement,
            topic_preferences,
        )
    )

    return filtered_topic_preferences


def update_topic_preferences_from_topic_preferences(
    user_id: int, topic_preferences: list[dict]
):
    update_sql = """
        UPDATE topic_preferences
        SET value = %s
        WHERE user_id = %s AND topic_id = %s AND part_id = %s AND excitement = %s
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            for topic_preference in topic_preferences:
                cur.execute(
                    update_sql,
                    (
                        topic_preference["value"],
                        user_id,
                        topic_preference["topic_id"],
                        topic_preference["part_id"],
                        topic_preference["excitement"],
                    ),
                )
            conn.commit()

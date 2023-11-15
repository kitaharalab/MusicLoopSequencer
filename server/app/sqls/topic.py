from psycopg2.extras import DictCursor

from .connection import get_connection
from .part import get_parts


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


def get_topic_preferences(user_id: str):
    select_sql = """
        SELECT
            topic_id,
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

    return response


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
        INSERT INTO topic_preferences (user_id, topic_id, part_id, value)
        values (%s, %s, %s, %s)
    """
    parts = get_parts()
    topic_id_ns = get_topic_id_ns()
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            for part in parts:
                for topic_id_n in topic_id_ns:
                    cur.execute(insert_sql, (user_id, topic_id_n["id"], part["id"], 1))
            conn.commit()

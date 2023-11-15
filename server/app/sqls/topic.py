from psycopg2.extras import DictCursor

from .connection import get_connection
from .part import get_parts


def get_topic_ids():
    select_sql = """
        SELECT
            id
        FROM
            topics
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(select_sql)
            result = cur.fetchall()
            response = [dict(row)["id"] for row in result]

    return response


def get_topic_preferences(user_id: str):
    select_sql = """
        SELECT
            topic_id,
            part_id,
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
            result = cur.fetchone()
            response = dict(result) if result is not None else None

    return response


def add_topic_preferences(user_id: str):
    insert_sql = """
        INSERT INTO topic_preferences (user_id, topic_id, part_id, value)
        values (%s, %s, %s, %s)
    """
    parts = get_parts()
    topic_ids = get_topic_ids()
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            for part in parts:
                for topic_id in topic_ids:
                    cur.execute(insert_sql, (user_id, topic_id, part["id"], 1))
            conn.commit()

from psycopg2.extras import DictCursor
from sqls.connection import get_connection


def get_topic_preferences_dict(firebase_id: str):
    select_sql = """
         SELECT
            *
        FROM
            topic_preferences
        WHERE
            user_id=%s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(select_sql, (firebase_id,))
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response if len(response) > 0 else None


def get_topic_preferences_tuple(firebase_id: str):
    topic_preferences = get_topic_preferences_dict(firebase_id)
    if not topic_preferences:
        return None
    # firebase_id, part_id, curve_excitement, topic_id, value
    tupled_topic_preferences = [
        (
            tp["user_id"],
            tp["part_id"],
            tp["excitement"],
            tp["topic_id"],
            tp["value"],
        )
        for tp in topic_preferences
    ]

    return tupled_topic_preferences

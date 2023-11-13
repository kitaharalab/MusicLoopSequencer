from psycopg2.extras import DictCursor

from .connection import get_connection


def get_loop_positions_by_part(part_id: int):
    sql = """
    SELECT id, name, excitement, x, y
    FROM loops
    where part_id=%s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (part_id,))
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response


def get_loop_music_by_id(loop_id: int):
    sql = """
    SELECT data
    FROM loops
    where id=%s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (loop_id,))
            result = cur.fetchone()
            response = dict(result)["data"].tobytes() if result is not None else None

    return response


def get_loop_topic_by_id(loop_id: int):
    sql = """
    SELECT value
    FROM loop_topics
    where loop_id=%s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (loop_id,))
            result = cur.fetchone()
            response = dict(result) if result is not None else None

    return response

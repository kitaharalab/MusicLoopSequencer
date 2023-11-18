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


def get_loop_and_topics_from_part(part_id: int):
    sql = """
    SELECT
        loops.id,
        loops.name,
        loops.excitement,
        loop_topics.topic_id,
        loop_topics.value
    FROM loops
    JOIN loop_topics
    ON loops.id=loop_topics.loop_id
    where
        loops.part_id=%s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (part_id,))
            response = [dict(row) for row in cur.fetchall()]

    return response


def get_loop_wav_from_loop_ids_by_mesure_part(loop_ids_by_mesure_part: list):
    sql = """
    SELECT id, data
    FROM loops
    where id=%s
    """
    response = []
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            for loop_ids_by_part in loop_ids_by_mesure_part:
                response.append([])
                for loop_id in loop_ids_by_part:
                    if loop_id is None or loop_id == "null":
                        response[-1].append(None)
                        continue
                    cur.execute(sql, (int(loop_id),))
                    result = cur.fetchone()
                    if result is not None:
                        response[-1].append(dict(result)["data"].tobytes())
                    else:
                        response[-1].append(None)

    return response


def get_loop_topics(loop_id: int):
    sql = """
    SELECT
        topic_id,
        value
    FROM loop_topics
    where
        loop_id=%s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (loop_id,))
            response = [dict(row) for row in cur.fetchall()]

    return response if len(response) > 0 else None

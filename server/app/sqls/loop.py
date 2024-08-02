from cache import cache
from psycopg2.extras import DictCursor

from .connection import get_connection


@cache.memoize()
def get_loop_id_from_id_chord(loop_id: int, chord: str):
    loop_name = get_loop_name_from_id(loop_id)
    if loop_name is None:
        return None

    loop_id_by_chord = get_loop_id_by_chord_from_name(loop_name)
    if list(loop_id_by_chord.keys())[0] is None:
        return loop_id

    return loop_id_by_chord.get(chord, None)


@cache.memoize()
def get_loop_name_from_id(loop_id: int):
    sql = """
    SELECT name
    FROM loops
    where id=%s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (loop_id,))
            result = cur.fetchone()
            response = dict(result)["name"] if result is not None else None

    return response


@cache.memoize()
def get_loop_id_by_chord_from_name(loop_name: str):
    sql = """
    SELECT id, chord
    FROM loops
    where name=%s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (loop_name,))
            result = cur.fetchall()
            data = [dict(row) for row in result]
            response = dict()
            for row in data:
                response[row["chord"]] = row["id"]

    return response


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


@cache.memoize()
def get_loop_and_topics_from_part(part_id: int):
    sql = """
    SELECT DISTINCT
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


def get_loop_wav_from_loop_ids_by_measure_part(loop_ids_by_measure_part: list):
    loop_ids = set()
    for loop_ids_by_part in loop_ids_by_measure_part:
        for loop_id in loop_ids_by_part:
            if loop_id is None or loop_id == "null":
                continue
            loop_ids.add(int(loop_id))

    sql = """
    SELECT id, data
    FROM loops
    where id in %s;
    """

    wav_data_by_id = dict()
    wav_query_result = None
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (tuple(loop_ids),))
            wav_query_result = [list(row) for row in cur.fetchall()]

    for row in wav_query_result:
        wav_data_by_id[row[0]] = row[1].tobytes()

    response = []
    for loop_ids_by_part in loop_ids_by_measure_part:
        response.append([])
        for loop_id in loop_ids_by_part:
            if loop_id is None or loop_id == "null":
                response[-1].append(None)
                continue

            response[-1].append(wav_data_by_id[loop_id])

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


def get_loop_info_topics(loop_id: int):
    sql = """
    select
        loops.id,
        loops.name,
        loops.excitement,
        loop_topics.topic_id,
        loop_topics.value
    from loops, loop_topics
    where
        loops.id = loop_topics.loop_id
        and loops.id = %s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (loop_id,))
            response = [dict(row) for row in cur.fetchall()]

    return response if len(response) > 0 else None

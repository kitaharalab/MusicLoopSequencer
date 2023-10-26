from psycopg2.extras import DictCursor

from .connection import get_connection


def get_excitement_curve_values(song_id: int):
    sql = """
    SELECT value
    FROM excitement_curve
    where song_id = %s
    order by index
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (song_id,))
            result = cur.fetchall()
            response = [dict(row).get("value") for row in result]

    return response


def get_excitement_curve_info(song_id: int):
    sql = """
    SELECT length, max_value
    FROM excitement_curve_info
    where song_id = %s
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (song_id,))
            result = cur.fetchone()
            response = dict(result) if result is not None else None

    return response


def get_excitement_curve(song_id: int):
    curve = get_excitement_curve_values(song_id)
    info = get_excitement_curve_info(song_id)
    if info is None or curve is None:
        return None

    response = {
        "curve": curve,
        "length": info["length"],
        "max_value": info["max_value"],
    }

    return response


def add_excitement_curve(song_id: int, curve: list[int], max_value: int):
    add_curve_sql = """
    INSERT INTO excitement_curve (song_id, index, value)
    VALUES (%s, %s, %s)
    """
    add_curve_info_sql = """
    INSERT INTO excitement_curve_info (song_id, length, max_value)
    VALUES (%s, %s, %s)
    """

    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            for i, value in enumerate(curve):
                cur.execute(add_curve_sql, (song_id, i, value))
            cur.execute(add_curve_info_sql, (song_id, len(curve), max_value))
            conn.commit()

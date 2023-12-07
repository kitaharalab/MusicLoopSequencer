from psycopg2.extras import DictCursor

from .connection import get_connection
from util.const import EXCITEMENT_VALUE_MAX, EXCITEMENT_VALUE_MIN
import json


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


def get_excitement_curve_preset():
    data = None
    with open("./sqls/excitement_curve_preset.json", "r") as f:
        data = json.load(f)
    response = {
        "curve": data,
        "max": 5,
    }
    return response


def add_excitement_curve(song_id: int, curve: list[int], max_value: int):
    adjust_curve = [
        value * (EXCITEMENT_VALUE_MAX - EXCITEMENT_VALUE_MIN) / max_value
        for value in curve
    ]
    insert_curve_values = [[song_id, i, value] for i, value in enumerate(adjust_curve)]
    insert_curve_values = sum(insert_curve_values, [])
    insert_curve_values_sql = ",".join(
        ["(%s, %s, %s)" for _ in range(len(adjust_curve))]
    )
    add_curve_sql = f"""
    INSERT INTO excitement_curve (song_id, index, value)
    VALUES {insert_curve_values_sql}
    """
    add_curve_info_sql = """
    INSERT INTO excitement_curve_info (song_id, length, max_value)
    VALUES (%s, %s, %s)
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(add_curve_sql, tuple(insert_curve_values))
            cur.execute(
                add_curve_info_sql, (song_id, len(adjust_curve), EXCITEMENT_VALUE_MAX)
            )
            conn.commit()

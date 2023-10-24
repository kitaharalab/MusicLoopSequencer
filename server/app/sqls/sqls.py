import os
from typing import Any

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import DictCursor

load_dotenv()


def get_connection():
    host = os.environ.get("PGHOST")
    dbname = os.environ.get("PGDATABASE")
    user = os.environ.get("PGUSER")
    password = os.environ.get("PGPASSWORD")
    return psycopg2.connect(host=host, dbname=dbname, user=user, password=password)


def get_parts() -> list[dict[str, Any]]:
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT * FROM parts")
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response


def add_song(song_loop_id_by_part, song_id):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            for part_id, loop_items in song_loop_id_by_part.items():
                for mesure1, loop_id in enumerate(loop_items):
                    cur.execute(
                        "INSERT INTO song_details (song_id, part_id, measure, loop_id) VALUES (%s, %s, %s, %s)",
                        (song_id, part_id, mesure1 + 1, loop_id),
                    )
            conn.commit()
    pass


def sound_array_wrap(sound_array):
    """
    Before:
        sound_array[measure][part_id] = loop_id_str
            0:drums
            1:bass
            2:synth
            3:sequence

    After:
        song_loop_id_by_part [ part_id_from_DB ] [ measure ] = loop_id_int
    """
    sound_array = list(zip(*sound_array))
    song_loop_id_by_part: dict[int, list[int | None]] = dict()
    parts = get_parts()
    name2index = {"Drums": 0, "Bass": 1, "Synth": 2, "Sequence": 3}
    for part in parts:
        part_id = part["id"]
        part_name = part["name"]
        song_loop_id_by_part[part_id] = list(
            map(
                lambda x: int(x) if x != "null" else None,
                sound_array[name2index[part_name]],
            )
        )

    return song_loop_id_by_part


def get_song_details(song_id):
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                "SELECT * FROM song_details WHERE song_id = %s order by part_id, measure",
                (song_id,),
            )
            result = cur.fetchall()
            response = [dict(row) for row in result]

    parts = get_parts()
    details_by_part_id = dict()
    for part in parts:
        part_id = part["id"]
        details_by_part_id[part_id] = list(
            filter(lambda x: x["part_id"] == part_id, response)
        )

    return response


def update_song_details(song_id: int, part_id: int, measure: int, loop_id: int):
    """楽曲において，ある小節における音素材を変更する

    Args:
       - song_id (int): 変更したい楽曲のID
       - part_id (int): 変更したい楽曲における楽器のID
       - measure (int): 変更したい小節の番号
       - loop_id (int): 変更先の音素材のID
    """

    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                "UPDATE song_details SET loop_id=%s WHERE song_id=%s and part_id=%s and measure=%s",
                (loop_id, song_id, part_id, measure),
            )
            conn.commit()

from psycopg2.extras import DictCursor
from util.const import fix_len

from .connection import get_connection
from .part import get_parts
from .loop import get_loop_id_from_id_chord
from util.const import CHORD_BY_MEASURE


def get_song_details(song_id):
    """楽曲の楽器ごとの各小節の情報を取得する

    Args:
        song_id (int): 楽曲のID

    Returns:
        dict: 楽器ごとに，小節ごとの音素材のIDを格納した辞書
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                "SELECT measure, loop_id, part_id FROM song_details WHERE song_id = %s order by part_id, measure",
                (song_id,),
            )
            result = cur.fetchall()
            response = [dict(row) for row in result]

    if len(response) == 0:
        return None

    parts = get_parts()
    details_by_part_id = dict()
    for part in parts:
        part_id = part["id"]
        details = list(filter(lambda x: x["part_id"] == part_id, response))
        details = sorted(details, key=lambda x: x["measure"])
        details = list(
            map(lambda x: {"loop_id": x["loop_id"], "measure": x["measure"]}, details)
        )
        details_by_part_id[part_id] = details

    return details_by_part_id


def get_song_loop_ids(song_id):
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
        details = list(filter(lambda x: x["part_id"] == part_id, response))
        loop_ids = list(map(lambda x: x["loop_id"], details))
        details_by_part_id[part_id] = loop_ids

    return details_by_part_id


def get_loop_id(song_id: int, part_id: int, measure: int) -> int:
    """楽曲において，ある小節における音素材を取得する

    Args:
       - song_id (int): 取得したい楽曲のID
       - part_id (int): 取得したい楽曲における楽器のID
       - measure (int): 取得したい小節の番号

    Returns:
       - loop_id (int): 取得したい音素材のID
    """
    result = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                """
                select loop_id
                from song_details
                WHERE
                    song_id=%s
                    and part_id=%s
                    and measure=%s
                """,
                (song_id, part_id, measure),
            )
            result = dict(cur.fetchone())

    return result["loop_id"]


def update_song_details(
    song_id: int,
    part_id: int,
    measure: int,
    loop_id: int,
    user_id: str,
    fix: int = 0,
    fix_length: int = 4,
):
    """楽曲において，ある小節における音素材を変更する

    Args:
       - song_id (int): 変更したい楽曲のID
       - part_id (int): 変更したい楽曲における楽器のID
       - measure (int): 変更したい小節の番号
       - loop_id (int): 変更先の音素材のID
    """

    if fix == 0:
        with get_connection() as conn:
            with conn.cursor() as cur:
                chord = CHORD_BY_MEASURE[measure % len(CHORD_BY_MEASURE)]
                chorded_loop_id = get_loop_id_from_id_chord(loop_id, chord)

                cur.execute(
                    "UPDATE song_details SET loop_id=%s WHERE song_id=%s and part_id=%s and measure=%s",
                    (chorded_loop_id, song_id, part_id, measure),
                )
            conn.commit()
        return

    # update
    with get_connection() as conn:
        with conn.cursor() as cur:
            start = (measure - 1) // fix_length * fix_length + 1
            end = start + fix_length
            for i in range(start, end):
                chord = CHORD_BY_MEASURE[i % len(CHORD_BY_MEASURE)]
                chorded_loop_id = get_loop_id_from_id_chord(loop_id, chord)

                cur.execute(
                    "UPDATE song_details SET loop_id=%s WHERE song_id=%s and part_id=%s and measure=%s",
                    (chorded_loop_id, song_id, part_id, i),
                )
        conn.commit()


def delete_song_details(song_id: int, part_id: int, measure: int, fix: int = 0):
    sql = """
    UPDATE song_details
    SET loop_id=NULL
    WHERE
        song_id=%s
        AND part_id=%s
        AND measure=%s
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            if fix == 0:
                cur.execute(sql, (song_id, part_id, measure))
            else:
                start = (measure - 1) // fix_len * fix_len + 1
                end = start + fix_len
                for i in range(start, end):
                    cur.execute(sql, (song_id, part_id, i))
            conn.commit()

from psycopg2.extras import DictCursor

from .connection import get_connection
from .log import change_loop_log
from .part import get_parts
from .song import get_project_id_from_song_id


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


def update_song_details(song_id: int, part_id: int, measure: int, loop_id: int):
    """楽曲において，ある小節における音素材を変更する

    Args:
       - song_id (int): 変更したい楽曲のID
       - part_id (int): 変更したい楽曲における楽器のID
       - measure (int): 変更したい小節の番号
       - loop_id (int): 変更先の音素材のID
    """
    from_loop_id = get_loop_id(song_id, part_id, measure)
    project_id = get_project_id_from_song_id(song_id)

    # log
    change_loop_log(project_id, song_id, part_id, measure, from_loop_id, loop_id)

    # update
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                "UPDATE song_details SET loop_id=%s WHERE song_id=%s and part_id=%s and measure=%s",
                (loop_id, song_id, part_id, measure),
            )
            conn.commit()

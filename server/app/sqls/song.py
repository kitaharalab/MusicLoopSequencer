from psycopg2.extras import DictCursor

from .connection import get_connection
from .log import create_song_log
from .part import get_parts


def create_song(song_loop_id_by_part, project_id, user_id):
    song_id = 0
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                "INSERT INTO songs (project_id) VALUES (%s) RETURNING id", (project_id,)
            )
            song_id = cur.fetchone()[0]
            conn.commit()

    create_song_log(project_id, song_id, user_id)

    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            for part_id, loop_items in song_loop_id_by_part.items():
                for mesure1, loop_id in enumerate(loop_items):
                    cur.execute(
                        "INSERT INTO song_details (song_id, part_id, measure, loop_id) VALUES (%s, %s, %s, %s)",
                        (song_id, part_id, mesure1 + 1, loop_id),
                    )
            conn.commit()

    return song_id


def sound_array_wrap(sound_array):
    """
    Before:
        sound_array[measure][part_id] = loop_id_str
            0:drums
            1:bass
            2:synth
            3:sequence

    After:
        song_loop_ids_by_part [ part_id_from_DB ] = list of loop id by measure
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


def get_project_id_from_song_id(song_id: int) -> int:
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                """
                SELECT project_id
                FROM songs
                WHERE id = %s
                """,
                (song_id,),
            )
            result = dict(cur.fetchone())
            return result["project_id"]
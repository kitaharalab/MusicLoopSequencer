from enum import Enum, auto
from typing import Any

from psycopg2.extras import DictCursor

from .connection import get_connection


class LogEvent(Enum):
    CREATE_SONG = auto()
    CHANGE_SONG = auto()
    PLAY_SONG = auto()
    STOP_SONG = auto()
    CHANGE_LOOP = auto()
    PLAY_LOOP = auto()


# EVENT TEXT NOT NULL,
# project_id INTEGER NOT NULL,
# song_id INTEGER NOT NULL,
# part_id INTEGER,
# measure INTEGER,
# loop_id INTEGER,
# from_loop_id INTEGER,
# to_loop_id INTEGER,
def create_song_log(project_id: int, song_id: int):
    sql = """
    insert into operation_logs (event, project_id, song_id) values (%s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                sql,
                (LogEvent.CREATE_SONG.name, project_id, song_id),
            )
            conn.commit()

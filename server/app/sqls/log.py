from enum import Enum, auto
from typing import Any

from psycopg2.extras import DictCursor

from .connection import get_connection


class LogEvent(Enum):
    CREATE_SONG = auto()
    PLAY_SONG = auto()
    CHANGE_LOOP = auto()
    PLAY_LOOP = auto()
    CREATE_PROJECT = auto()
    OPEN_PROJECT = auto()


# EVENT TEXT NOT NULL,
# project_id INTEGER NOT NULL,
# song_id INTEGER NOT NULL,
# part_id INTEGER,
# measure INTEGER,
# loop_id INTEGER,
# from_loop_id INTEGER,
# to_loop_id INTEGER,
def create_song_log(project_id: int, song_id: int, user_id: str):
    sql = """
    insert into operation_logs (event, project_id, song_id, user_id) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                sql,
                (LogEvent.CREATE_SONG.name, project_id, song_id, user_id),
            )
            conn.commit()


def change_loop_log(
    project_id: int,
    song_id: int,
    part_id: int,
    measure: int,
    from_loop_id: int,
    to_loop_id: int,
    user_id: str,
):
    sql = """
    insert into
        operation_logs (event, project_id, song_id, part_id, measure, from_loop_id, to_loop_id, user_id)
    values
        (%s, %s, %s, %s, %s, %s, %s, %s);
    """

    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                sql,
                (
                    LogEvent.CHANGE_LOOP.name,
                    project_id,
                    song_id,
                    part_id,
                    measure,
                    from_loop_id,
                    to_loop_id,
                    user_id,
                ),
            )
            conn.commit()


def play_song_log(project_id: int, song_id: int, user_id: str):
    sql = """
    insert into operation_logs (event, project_id, song_id, user_id) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                sql,
                (LogEvent.PLAY_SONG.name, project_id, song_id, user_id),
            )
            conn.commit()


def play_loop_log(
    project_id: int, song_id: int, part_id: int, loop_id: int, user_id: str
):
    sql = """
    insert into
        operation_logs (event, project_id, song_id, part_id, loop_id, user_id)
    values
        (%s, %s, %s, %s, %s, %s);
    """

    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                sql,
                (
                    LogEvent.PLAY_LOOP.name,
                    project_id,
                    song_id,
                    part_id,
                    loop_id,
                    user_id,
                ),
            )
            conn.commit()


def create_project_log(project_id: int, user_id: str):
    sql = """
    insert into operation_logs (event, project_id, user_id) values (%s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                sql,
                (LogEvent.CREATE_PROJECT.name, project_id, user_id),
            )
            conn.commit()


def open_project_log(project_id: int, user_id: str):
    sql = """
    insert into operation_logs (event, project_id, user_id) values (%s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                sql,
                (LogEvent.OPEN_PROJECT.name, project_id, user_id),
            )
            conn.commit()

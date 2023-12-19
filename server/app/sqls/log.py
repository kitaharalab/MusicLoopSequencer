from enum import Enum, auto
from math import e
from typing import Any

from psycopg2.extras import DictCursor

from .connection import get_connection


class LogEvent(Enum):
    CREATE_SONG = auto()
    PLAY_SONG = auto()
    PAUSE_SONG = auto()
    STOP_SONG = auto()
    CHANGE_LOOP = auto()
    INSERT_LOOP = auto()
    DELETE_LOOP = auto()
    PLAY_LOOP = auto()
    CREATE_PROJECT = auto()
    OPEN_PROJECT = auto()
    CHECK_SONG_LOOP = auto()
    LOOP_MUTE = auto()
    LOOP_UNMUTE = auto()
    REST = auto()
    REST_END = auto()
    ACTIVE = auto()
    INACTIVE = auto()
    EVALUATION = auto()


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
        with conn.cursor() as cur:
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
    event: LogEvent = LogEvent.CHANGE_LOOP,
):
    sql = """
    insert into
        operation_logs (event, project_id, song_id, part_id, measure, from_loop_id, to_loop_id, user_id)
    values
        (%s, %s, %s, %s, %s, %s, %s, %s);
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (
                    event.name,
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


def insert_loop_log(
    project_id: int,
    song_id: int,
    part_id: int,
    measure: int,
    from_loop_id: int,
    to_loop_id: int,
    user_id: str,
):
    change_loop_log(
        project_id=project_id,
        song_id=song_id,
        part_id=part_id,
        measure=measure,
        from_loop_id=from_loop_id,
        to_loop_id=to_loop_id,
        user_id=user_id,
        event=LogEvent.INSERT_LOOP,
    )


def delete_loop_log(
    project_id: int,
    song_id: int,
    part_id: int,
    measure: int,
    loop_id: int,
    user_id: str,
):
    change_loop_log(
        project_id=project_id,
        song_id=song_id,
        part_id=part_id,
        measure=measure,
        from_loop_id=loop_id,
        to_loop_id=None,
        user_id=user_id,
        event=LogEvent.DELETE_LOOP,
    )


def play_song_log(project_id: int, song_id: int, user_id: str):
    sql = """
    insert into operation_logs (event, project_id, song_id, user_id) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (LogEvent.PLAY_SONG.name, project_id, song_id, user_id),
            )
            conn.commit()


def pause_song_log(project_id: int, song_id: int, user_id: str):
    sql = """
    insert into operation_logs (event, project_id, song_id, user_id) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (LogEvent.PAUSE_SONG.name, project_id, song_id, user_id),
            )
            conn.commit()


def stop_song_log(project_id: int, song_id: int, user_id: str):
    sql = """
    insert into operation_logs (event, project_id, song_id, user_id) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (LogEvent.STOP_SONG.name, project_id, song_id, user_id),
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
        with conn.cursor() as cur:
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
        with conn.cursor() as cur:
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
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (LogEvent.OPEN_PROJECT.name, project_id, user_id),
            )
            conn.commit()


def check_song_loop_log(
    project_id: int,
    song_id: int,
    part_id: int,
    measure: int,
    loop_id: int,
    user_id: str,
):
    sql = """
    insert into
        operation_logs (event, project_id, song_id, part_id, measure, loop_id, user_id)
    values
        (%s, %s, %s, %s, %s, %s, %s);
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (
                    LogEvent.CHECK_SONG_LOOP.name,
                    project_id,
                    song_id,
                    part_id,
                    measure,
                    loop_id,
                    user_id,
                ),
            )
            conn.commit()


def loop_mute_log_base(event: LogEvent, project_id: int, song_id: int, user_id: str):
    sql = """
    insert into operation_logs (event, project_id, song_id, user_id) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (event.name, project_id, song_id, user_id),
            )
            conn.commit()


def loop_mute_log(project_id: int, song_id: int, user_id: str):
    loop_mute_log_base(LogEvent.LOOP_MUTE, project_id, song_id, user_id)


def loop_unmute_log(project_id: int, song_id: int, user_id: str):
    loop_mute_log_base(LogEvent.LOOP_UNMUTE, project_id, song_id, user_id)


def rest_log(project_id: int, song_id: int, user_id: str, restEvent: bool = True):
    sql = """
    insert into operation_logs (event, project_id, song_id, user_id) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            restEvent = LogEvent.REST if restEvent else LogEvent.REST_END
            cur.execute(
                sql,
                (restEvent.name, project_id, song_id, user_id),
            )
            conn.commit()


def active_log(user_id: str, project_id: int, active: bool):
    event = LogEvent.ACTIVE if active else LogEvent.INACTIVE
    sql = """
    insert into operation_logs (event, user_id, project_id, active) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (event.name, user_id, project_id, active),
            )
            conn.commit()


def evaluation_log(user_id: str, project_id: int, song_id: int, evaluation_value: int):
    sql = """
    insert into operation_logs (event, user_id, project_id, evaluation) values (%s, %s, %s, %s);
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (LogEvent.EVALUATION.name, user_id, project_id, evaluation_value),
            )
        conn.commit()

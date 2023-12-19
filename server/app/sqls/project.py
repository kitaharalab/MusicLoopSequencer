from psycopg2.extras import DictCursor

from .connection import get_connection


def add_project(project_name: str, user_id: str):
    create_sql = (
        "INSERT INTO projects (name, user_id) VALUES (%s, %s) RETURNING id, name"
    )
    new_id = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(create_sql, (project_name, user_id))
            returning = cur.fetchone()
            new_id = dict(returning) if returning is not None else None
            conn.commit()

    return new_id


def get_projects(user_id: str):
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT id, name FROM projects WHERE user_id = %s", (user_id,))
            result = cur.fetchall()
            response = [dict(row) for row in result]
    return response


def get_project(project_id: int):
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT id, name FROM projects WHERE id = %s", (project_id,))
            result = cur.fetchone()
            response = dict(result) if result is not None else None
    return response


def get_project_song_ids(project_id):
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT id FROM songs WHERE project_id = %s", (project_id,))
            result = cur.fetchall()
            response = [dict(row) for row in result]
    return response

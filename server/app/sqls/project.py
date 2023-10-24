from psycopg2.extras import DictCursor

from .connection import get_connection


def add_project(project_name: str):
    create_sql = "INSERT INTO projects (name) VALUES (%s) RETURNING id, name"
    new_id = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(create_sql, (project_name,))
            returning = cur.fetchone()
            new_id = dict(returning) if returning is not None else None
            conn.commit()

    return new_id


def get_projects():
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT * FROM projects")
            result = cur.fetchall()
            response = [dict(row) for row in result]
    return response

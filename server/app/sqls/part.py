from typing import Any

from psycopg2.extras import DictCursor

from .connection import get_connection


def get_parts() -> list[dict[str, Any]]:
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT * FROM parts")
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response

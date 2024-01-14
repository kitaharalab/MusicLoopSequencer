from sqls.connection import get_connection
from psycopg2.extras import DictCursor
from cache import cache


@cache.memoize()
def get_all():
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT * FROM structure ORDER BY id")
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response


@cache.memoize()
def get_from_name(name: str):
    structures = get_all()
    structure = next(filter(lambda x: x["name"] == name, structures), None)
    return structure

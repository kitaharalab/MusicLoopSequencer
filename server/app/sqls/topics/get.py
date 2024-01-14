from sqls.connection import get_connection
from psycopg2.extras import DictCursor
from util.const import topic_n


def get_topic_with_excitement():
    sql = """
        SELECT
            *
        FROM
            topics
        WHERE
            excitement IS NOT NULL
            AND number = %s;
    """
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(sql, (topic_n,))
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response

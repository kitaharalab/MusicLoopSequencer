from flask import current_app
from psycopg2.extras import DictCursor, execute_values
from sqls.connection import get_connection

from .make_sql import make_exists_topic_preferences, make_insert_topic_preferences


def init_topic_preferences(firebase_id: str):
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            exists_topic_preferences = make_exists_topic_preferences(firebase_id)

            cur.execute(*exists_topic_preferences)
            result = cur.fetchone()
            exists = result["exists"] if result else False
            if exists:
                return

            insert_topic_preferences = make_insert_topic_preferences(firebase_id)

            execute_values(cur, *insert_topic_preferences)
        conn.commit()

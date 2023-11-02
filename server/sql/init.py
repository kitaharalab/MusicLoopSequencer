import os
import pprint

import psycopg2
from dotenv import load_dotenv
from insert_loops import insert_loops
from psycopg2.extras import DictCursor

load_dotenv()


def get_connection():
    host = os.environ.get("PGHOST")
    dbname = os.environ.get("PGDATABASE")
    user = os.environ.get("PGUSER")
    password = os.environ.get("PGPASSWORD")
    return psycopg2.connect(host=host, dbname=dbname, user=user, password=password)


if __name__ == "__main__":
    # create table
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            this_dir_path = os.path.dirname(__file__)

            sql_file = os.path.join(this_dir_path, "create_table.sql")
            with open(sql_file) as f:
                sql = f.read()
                cur.execute(sql)

    # insert loops
    # current directory: MusicLoopSequencer/server
    insert_loops()

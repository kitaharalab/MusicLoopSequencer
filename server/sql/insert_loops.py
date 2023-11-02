import os

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import DictCursor

load_dotenv()


def get_connection():
    host = os.environ.get("PGHOST")
    dbname = os.environ.get("PGDATABASE")
    user = os.environ.get("PGUSER")
    password = os.environ.get("PGPASSWORD")
    return psycopg2.connect(host=host, dbname=dbname, user=user, password=password)


def get_parts():
    response = None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute("SELECT * FROM parts")
            result = cur.fetchall()
            response = [dict(row) for row in result]

    return response


def readFile(path: str):
    raw_data = None
    with open(path) as f:
        raw_data = f.read().split("\n")
    data = list(filter(lambda x: x != "", raw_data))
    return data


def readLoopsPath(partName: str):
    path = f"./app/text/{partName.lower()}_word_list.txt"
    sounds = readFile(path)

    return sounds


def insert_loop_path(path: str, part_id: int):
    sql = """
    insert into loop_paths (path, part_id) values (%s, %s);
    """

    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cursor:
            cursor.execute(sql, (path, part_id))
            conn.commit()


def insert_loops():
    parts = get_parts()
    for part in parts:
        print(part["name"])
        loops = readLoopsPath(part["name"])
        for loop in loops:
            insert_loop_path(loop, part["id"])


if __name__ == "__main__":
    insert_loops()

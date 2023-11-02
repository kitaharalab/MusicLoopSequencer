import os

import psycopg2


def get_connection():
    host = os.environ.get("PGHOST")
    dbname = os.environ.get("PGDATABASE")
    user = os.environ.get("PGUSER")
    password = os.environ.get("PGPASSWORD")
    return psycopg2.connect(host=host, dbname=dbname, user=user, password=password)

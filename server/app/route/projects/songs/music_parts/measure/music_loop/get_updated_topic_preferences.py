import os
import numpy as np
from sklearn import preprocessing
import math
import statistics
import librosa

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import DictCursor
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D


load_dotenv()

def get_connection():
    host = os.environ.get("PGHOST")
    dbname = os.environ.get("PGDATABASE")
    user = os.environ.get("PGUSER")
    password = os.environ.get("PGPASSWORD")
    return psycopg2.connect(host=host, dbname=dbname, user=user, password=password)


def get_updated_topic_preferences(user_id, loop_id):
    response = []
        
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            #cur.execute("select * from operation_logs where user_id = " + username)
            cur.execute("select id, name, part_id, excitement from loops where id = " + str(loop_id))
            result = cur.fetchall()
            response = [dict(row) for row in result]
    part_id = response[0]['part_id']
    excitement = response[0]['excitement']

    response = []
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            #cur.execute("select * from operation_logs where user_id = " + username)
            cur.execute("select * from loop_topics where loop_id = " + str(loop_id) + " and (topic_id = 3 or topic_id = 4 or topic_id = 5) order by topic_id")
            result = cur.fetchall()
            response = [dict(row) for row in result]
    topic_ratio = [0.0 for i in range(3)]
    for i in range(len(response)):
        topic_ratio[response[i]['topic_id'] - 3] = response[i]['value']

    response = []
    with get_connection() as conn:
        with conn.cursor(cursor_factory=DictCursor) as cur:
            #cur.execute("select * from operation_logs where user_id = " + username)
            cur.execute("select * from topic_preferences where user_id = '" + user_id + "' and part_id = " + str(part_id) + " and excitement = " + str(excitement) + " and (topic_id = 3 or topic_id = 4 or topic_id = 5) order by topic_id")
            result = cur.fetchall()
            response = [dict(row) for row in result]
            
    topic_preferences = [1.0 for i in range(3)]
    for i in range(len(response)):
        topic_preferences[i] = response[i]['value']

    for i in range(len(topic_preferences)):
        topic_preferences[i] += topic_ratio[i]

    

    return topic_preferences, user_id, part_id, excitement


def main():
    user_id = 'BLT4RUBY5ta3bZlyCLSRJQ57LEJ3'
    loop_id = 1
    topic_preferences = get_updated_topic_preferences(user_id, loop_id)
    print(topic_preferences)

if __name__ == "__main__":
    main()

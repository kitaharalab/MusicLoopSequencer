CREATE TABLE IF NOT EXISTS
    topics (
        id serial PRIMARY KEY,
        NAME TEXT NOT NULL,
        number INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS
    loop_topics (
        loop_id INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        VALUE DOUBLE PRECISION NOT NULL,
        FOREIGN KEY (loop_id) REFERENCES loops (id),
        FOREIGN KEY (topic_id) REFERENCES topics (id),
        PRIMARY KEY (loop_id, topic_id)
    );
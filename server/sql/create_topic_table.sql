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

-- part id と盛り上がり度で，トピック数に基づくトピックに対して，値がある
-- topic0,
-- topic1
CREATE TABLE IF NOT EXISTS
    topic_preferences (
        user_id TEXT NOT NULL,
        topic_id INTEGER NOT NULL,
        part_id INTEGER NOT NULL,
        excitement INTEGER NOT NULL,
        VALUE DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (topic_id) REFERENCES topics (id),
        FOREIGN KEY (part_id) REFERENCES parts (id),
        PRIMARY KEY (topic_id, user_id, part_id, excitement)
    );
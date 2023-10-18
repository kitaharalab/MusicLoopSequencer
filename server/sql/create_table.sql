-- 楽器テーブル
DROP TABLE IF EXISTS parts;

CREATE TABLE
    parts (id serial PRIMARY KEY, NAME TEXT NOT NULL);

INSERT INTO
    parts (NAME)
VALUES
    ('Drums'),
    ('Bass'),
    ('Synth'),
    ('Sequence');
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

-- Projectsテーブル
DROP TABLE IF EXISTS projects;

CREATE TABLE
    projects (id serial PRIMARY KEY, NAME TEXT NOT NULL);

INSERT INTO
    projects (NAME)
VALUES
    ('test');
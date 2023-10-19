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
    ('test'),
    ('second');

-- 楽曲テーブル
-- projectが保有している楽曲
DROP TABLE IF EXISTS songs;

CREATE TABLE
    songs (
        id serial PRIMARY KEY,
        project_id INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id)
    );

INSERT INTO
    songs (project_id)
VALUES
    (1),
    (1),
    (1),
    (2),
    (1);
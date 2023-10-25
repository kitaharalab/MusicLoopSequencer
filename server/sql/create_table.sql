-- 楽器テーブル
DROP TABLE IF EXISTS parts CASCADE;

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
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE
    projects (id serial PRIMARY KEY, NAME TEXT NOT NULL);

INSERT INTO
    projects (NAME)
VALUES
    ('test'),
    ('second');

-- 楽曲テーブル
-- projectが保有している楽曲
DROP TABLE IF EXISTS songs CASCADE;

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

-- 楽曲詳細テーブル
DROP TABLE IF EXISTS song_details CASCADE;

CREATE TABLE
    song_details (
        song_id INTEGER NOT NULL,
        part_id INTEGER NOT NULL,
        measure INTEGER NOT NULL,
        loop_id INTEGER,
        FOREIGN KEY (song_id) REFERENCES songs (id),
        FOREIGN KEY (part_id) REFERENCES parts (id),
        PRIMARY KEY (song_id, part_id, measure)
    );

INSERT INTO
    song_details (song_id, part_id, measure, loop_id)
VALUES
    (1, 1, 1, 38),
    (1, 2, 2, 91),
    (1, 3, 3, 51),
    (1, 4, 4, 128),
    (1, 1, 5, 38);

-- 盛り上がり度曲線テーブル
DROP TABLE IF EXISTS excitement_curve CASCADE;

CREATE TABLE
    excitement_curve (
        song_id INTEGER NOT NULL,
        excitement_id serial,
        excitement INTEGER NOT NULL,
        FOREIGN KEY (song_id) REFERENCES songs (id),
        PRIMARY KEY (song_id, excitement_id)
    );

INSERT INTO
    excitement_curve (song_id, excitement)
VALUES
    (1, 0),
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    (1, 6),
    (1, 7);
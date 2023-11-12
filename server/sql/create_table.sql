-- ユーザテーブル
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE
    users (
        id serial PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL
    );

INSERT INTO
    users (user_id)
VALUES
    ('user_test'),
    ('experiment_user');

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
    projects (
        id serial PRIMARY KEY,
        NAME TEXT NOT NULL,
        user_id TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

INSERT INTO
    projects (NAME, user_id)
VALUES
    ('test', 'user_test'),
    ('second', 'user_test');

-- 実験用プロジェクト
INSERT INTO
    projects (NAME, user_id)
VALUES
    ('ExperimentUserApplicable', 'experiment_user'),
    ('ExperimentUserNotApplicable', 'experiment_user'),
    ('ExperimentRandomApplicable', 'experiment_user');

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
        INDEX INTEGER NOT NULL,
        VALUE INTEGER NOT NULL,
        FOREIGN KEY (song_id) REFERENCES songs (id),
        PRIMARY KEY (song_id, INDEX)
    );

INSERT INTO
    excitement_curve (song_id, INDEX, VALUE)
VALUES
    (1, 0, 10),
    (1, 1, 15),
    (1, 2, 20),
    (1, 3, 5),
    (1, 4, 89),
    (1, 5, 27),
    (1, 6, 99),
    (1, 7, 76);

-- 盛り上がり度曲線の詳細テーブル
DROP TABLE IF EXISTS excitement_curve_info CASCADE;

CREATE TABLE
    excitement_curve_info (
        song_id INTEGER NOT NULL,
        LENGTH INTEGER NOT NULL,
        max_value INTEGER NOT NULL,
        FOREIGN KEY (song_id) REFERENCES songs (id),
        PRIMARY KEY (song_id)
    );

INSERT INTO
    excitement_curve_info (song_id, LENGTH, max_value)
VALUES
    (1, 10, 100);

-- 操作ログテーブル
DROP TABLE IF EXISTS operation_logs CASCADE;

SET
    SESSION timezone TO 'Asia/Tokyo';

CREATE TABLE
    operation_logs (
        id serial PRIMARY KEY,
        TIME TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        EVENT TEXT NOT NULL,
        user_id TEXT NOT NULL,
        project_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        part_id INTEGER,
        measure INTEGER,
        loop_id INTEGER,
        from_loop_id INTEGER,
        to_loop_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (song_id) REFERENCES songs (id),
        FOREIGN KEY (part_id) REFERENCES parts (id),
        FOREIGN KEY (loop_id) REFERENCES loops (id),
        FOREIGN KEY (from_loop_id) REFERENCES loops (id),
        FOREIGN KEY (to_loop_id) REFERENCES loops (id)
    );
-- ユーザテーブル
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE
    users (
        id serial PRIMARY KEY,
        firebase_id TEXT UNIQUE NOT NULL,
        own_id TEXT NOT NULL
    );


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
        FOREIGN KEY (user_id) REFERENCES users (firebase_id)
    );



-- 楽曲テーブル
-- projectが保有している楽曲
DROP TABLE IF EXISTS songs CASCADE;

CREATE TABLE
    songs (
        id serial PRIMARY KEY,
        project_id INTEGER NOT NULL,
        evaluation INTEGER NOT NULL DEFAULT 0,
        wave_data bytea NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id)
    );

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
        FOREIGN KEY (loop_id) REFERENCES loops (id),
        PRIMARY KEY (song_id, part_id, measure)
    );

-- 盛り上がり度曲線テーブル
DROP TABLE IF EXISTS excitement_curve CASCADE;

CREATE TABLE
    excitement_curve (
        song_id INTEGER NOT NULL,
        INDEX INTEGER NOT NULL,
        VALUE real NOT NULL,
        FOREIGN KEY (song_id) REFERENCES songs (id),
        PRIMARY KEY (song_id, INDEX)
    );

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
        song_id INTEGER,
        part_id INTEGER,
        measure INTEGER,
        loop_id INTEGER,
        from_loop_id INTEGER,
        to_loop_id INTEGER,
        active boolean,
        evaluation INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (firebase_id),
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (song_id) REFERENCES songs (id),
        FOREIGN KEY (part_id) REFERENCES parts (id),
        FOREIGN KEY (loop_id) REFERENCES loops (id),
        FOREIGN KEY (from_loop_id) REFERENCES loops (id),
        FOREIGN KEY (to_loop_id) REFERENCES loops (id)
    );
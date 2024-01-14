BEGIN;

-- structure
DROP TABLE if EXISTS structure cascade;

CREATE TABLE
    structure (id serial PRIMARY key, name text NOT NULL);

INSERT INTO
    structure (name)
VALUES
    ('intro'),
    ('breakdown'),
    ('buildup'),
    ('drop'),
    ('outro');

-- \d structure
SELECT
    *
FROM
    structure;

-- song structure
DROP TABLE if EXISTS song_structure cascade;

CREATE TABLE
    song_structure (
        id serial PRIMARY key,
        song_id INTEGER NOT NULL REFERENCES songs (id),
        structure_id INTEGER NOT NULL REFERENCES structure (id),
        start_measure INTEGER NOT NULL,
        end_measure INTEGER NOT NULL
    );

-- \d song_structure
END;
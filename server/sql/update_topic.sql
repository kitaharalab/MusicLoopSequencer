BEGIN;

ALTER TABLE topics
ADD COLUMN if NOT EXISTS excitement INTEGER;

SELECT
    *
FROM
    topics;

INSERT INTO
    topics (name, number, excitement)
VALUES
    ('topic0', 3, 0),
    ('topic0', 3, 1),
    ('topic0', 3, 2),
    ('topic0', 3, 3),
    ('topic0', 3, 4),
    ('topic1', 3, 0),
    ('topic1', 3, 1),
    ('topic1', 3, 2),
    ('topic1', 3, 3),
    ('topic1', 3, 4),
    ('topic2', 3, 0),
    ('topic2', 3, 1),
    ('topic2', 3, 2),
    ('topic2', 3, 3),
    ('topic2', 3, 4);

SELECT
    *
FROM
    topics;

END;
CREATE TABLE IF NOT EXISTS
    loops (
        id serial PRIMARY KEY,
        NAME TEXT NOT NULL,
        part_id INTEGER NOT NULL,
        excitement INTEGER NOT NULL,
        DATA bytea NOT NULL,
        x DOUBLE PRECISION,
        y DOUBLE PRECISION FOREIGN KEY (part_id) REFERENCES parts (id)
    );

-- ALTER TABLE loops
-- ADD IF NOT EXISTS x DOUBLE PRECISION;
-- ALTER TABLE loops
-- ADD IF NOT EXISTS y DOUBLE PRECISION;
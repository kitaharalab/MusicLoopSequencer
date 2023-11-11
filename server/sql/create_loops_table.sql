CREATE TABLE
    loops (
        id serial PRIMARY KEY,
        NAME TEXT NOT NULL,
        part_id INTEGER NOT NULL,
        excitement INTEGER NOT NULL,
        DATA bytea NOT NULL,
        FOREIGN KEY (part_id) REFERENCES parts (id)
    );
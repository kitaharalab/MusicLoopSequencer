pg_dump --no-owner --no-privileges --schema-only --clean > dump_schema.sql
pg_dump --no-owner --no-privileges -t parts -t loops -t loop_topics -t topics --data-only --clean > dump.sql

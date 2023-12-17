pg_dump --no-owner --no-privileges --schema-only > dump_schema.sql
pg_dump --no-owner --no-privileges -t parts -t loops -t loop_topics -t topics --data-only > dump.sql

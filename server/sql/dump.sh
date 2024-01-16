pg_dump --no-owner --no-privileges --schema-only -c > dump_schema.sql
pg_dump --no-owner --no-privileges -t parts -t loops -t loop_topics -t topics -t structure --data-only > dump.sql

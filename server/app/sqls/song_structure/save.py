from sqls.connection import get_connection
from sqls.structure import get_from_name
from psycopg2.extras import execute_values


def save_song_structure(song_id, song_structure: list[dict]):
    sql = """
    INSERT INTO
        song_structure (song_id, structure_id, start_measure, end_measure)
    VALUES
        %s;
    """
    insert_values = []
    for section in song_structure:
        structure = get_from_name(section["section_name"])
        insert_values.append(
            (
                song_id,
                structure["id"],
                section["start"],
                section["end"],
            )
        )

    with get_connection() as conn:
        with conn.cursor() as cur:
            execute_values(cur, sql, insert_values)
        conn.commit()

import io

from pydub import AudioSegment
from sqls import get_loop_wav_from_loop_ids_by_mesure_part


def connect_sound(sound_list_by_mesure_part, projectid, mode, songid):
    """音素材を繋げる"""
    loop_wavs_by_measure_part = get_loop_wav_from_loop_ids_by_mesure_part(
        sound_list_by_mesure_part
    )
    output_sound = AudioSegment.silent()
    output_sound = output_sound[0:0]

    for loop_wavs_by_part in loop_wavs_by_measure_part:
        block_sound = None
        for loop_wav in loop_wavs_by_part:
            if loop_wav is None:
                continue

            wav_data = io.BytesIO(loop_wav)
            if block_sound is None:
                block_sound = AudioSegment.from_file(wav_data, format="wav")
            else:
                block_sound = block_sound.overlay(
                    AudioSegment.from_file(wav_data, format="wav")
                )
        output_sound = output_sound + block_sound
    # connect_new_song(projectid, output_sound, mode, songid)

    wav_data = io.BytesIO()
    output_sound.export(wav_data, format="wav")
    wav_data_bytes = wav_data.getvalue()
    return songid, wav_data_bytes

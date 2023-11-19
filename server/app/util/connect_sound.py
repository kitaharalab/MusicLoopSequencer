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
            sound = AudioSegment.from_file(wav_data, format="wav")

            if block_sound is None:
                block_sound = sound
            else:
                block_sound = block_sound.overlay(sound)
        output_sound = output_sound + block_sound

    wav_data = io.BytesIO()
    # 2Byte = 16bit
    output_sound.set_sample_width(2).set_frame_rate(44100).export(
        wav_data, format="wav"
    )
    wav_data_bytes = wav_data.getvalue()
    return songid, wav_data_bytes
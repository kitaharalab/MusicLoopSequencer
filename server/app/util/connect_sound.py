import io

from pydub import AudioSegment
from sqls import get_loop_wav_from_loop_ids_by_measure_part
from cache import cache


def connect_sound(sound_list_by_measure_part, project_id, mode, song_id):
    """音素材を繋げる"""
    loop_wav_by_measure_part = get_loop_wav_from_loop_ids_by_measure_part(
        sound_list_by_measure_part
    )
    output_sound = AudioSegment.silent()
    output_sound = output_sound[0:0]

    for loop_wav_by_part in loop_wav_by_measure_part:
        measure_sound = wav_overlay(loop_wav_by_part)
        output_sound = output_sound + measure_sound

    wav_data = io.BytesIO()
    # 2Byte = 16bit
    output_sound.set_sample_width(2).set_frame_rate(44100).export(
        wav_data, format="mp3"
    )
    wav_data_bytes = wav_data.getvalue()
    return song_id, wav_data_bytes


@cache.memoize()
def wav_overlay(loop_wav_by_part: list):
    overlay = None
    for loop_wav in loop_wav_by_part:
        if loop_wav is None:
            continue

        sound = wav_to_audio_segment(loop_wav)

        if overlay is None:
            overlay = sound
        else:
            overlay = overlay.overlay(sound)
    if overlay is None:
        overlay = AudioSegment.silent()

    return overlay


@cache.memoize()
def wav_to_audio_segment(wav_data):
    wav_data = io.BytesIO(wav_data)
    sound = AudioSegment.from_file(wav_data, format="mp3")
    return sound

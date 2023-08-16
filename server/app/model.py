import os
import random
import re
import time

# import pyaudio
import wave

import cv2
import numpy as np
from hmmlearn import hmm
from pydub import AudioSegment
from pydub.playback import play


class Model:
    """
    Model（処理）
    受け取った線を盛り上がり度に変換する
    HMMの作成
    盛り上がり度から音素材の選択を行う
    音楽のパートわけ
    音楽の作成
    テキストの読み込み
    動画の分析
    """

    def __init__(self, line_height, block_width, line_block_height):
        # Viewクラスから使用したい値を初期化
        self.line_height = line_height
        self.block_width = block_width
        self.line_block_height = line_block_height
        # 音素材を固定する小節数
        self.fix_len = 4
        # HMMのモデルを初期化
        self.initializationHmm()
        # 動画の盛り上がりを初期化
        self.motion_excitement_array = list()
        # 前回のデータを消去
        if os.path.exists("./TechnoTrance/output.wav"):
            os.remove("./TechnoTrance/output.wav")

    def initializationExcitement(self, pixel_array):
        """盛り上がりの初期化"""
        self.excitement_len = int(len(pixel_array) / self.block_width)
        self.excitement_array = [0] * self.excitement_len
        # 前回のデータを消去
        if os.path.exists("./TechnoTrance/output.wav"):
            os.remove("./TechnoTrance/output.wav")

    def chengeExcitement(self, pixcel_array):
        """盛り上がり度に変換"""
        for i in range(self.excitement_len):
            # １ブロックの範囲を決定
            block_start = int(i * self.block_width)
            block_finish = int(block_start + self.block_width)
            # ブロックの合計から平均を計算
            block_total = 0
            for j in range(block_start, block_finish):
                block_total += abs((pixcel_array[j] - self.line_height))

            self.excitement_array[i] = int(
                block_total / self.block_width / (self.line_block_height)
            )

        return self.excitement_array

    def initializationHmm(self):
        """HMMモデルの初期化"""

        """
        状態
         0000 0
         0001 1
         0010 2
         0011 3
         0100 4
         0101 5
         0110 6
         0111 7
         1000 8
         1001 9
         1010 10
         1011 11
         1100 12
         1101 13
         1110 14
         1111 15


        """
        # 出力確率（共通）
        emissprob = np.array(
            [
                [0, 0, 0, 0, 0],
                [0.4, 0.2, 0.2, 0.1, 0.1],
                [0.39, 0.21, 0.2, 0.1, 0.1],
                [0.25, 0.3, 0.25, 0.1, 0.1],
                [0.39, 0.21, 0.2, 0.1, 0.1],
                [0.25, 0.3, 0.25, 0.1, 0.1],
                [0.25, 0.3, 0.25, 0.1, 0.1],
                [0.15, 0.2, 0.3, 0.2, 0.15],
                [0.35, 0.25, 0.2, 0.1, 0.1],
                [0.2, 0.2, 0.3, 0.1, 0.1],
                [0.2, 0.2, 0.35, 0.15, 0.1],
                [0.1, 0.1, 0.2, 0.25, 0.35],
                [0.2, 0.2, 0.35, 0.15, 0.1],
                [0.1, 0.1, 0.2, 0.25, 0.35],
                [0.1, 0.1, 0.2, 0.25, 0.35],
                [0.05, 0.05, 0.25, 0.25, 0.4],
            ]
        )

        # no part
        no_part_startprob = np.array(
            [
                0,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
                0.06666666666,
            ]
        )
        no_part_transmat = np.array(
            [
                [
                    0,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                    0.06666666666,
                ]
            ]
            * 16
        )
        self.no_part_hmm_model = hmm.MultinomialHMM(n_components=16)
        self.no_part_hmm_model.startprob_ = no_part_startprob
        self.no_part_hmm_model.transmat_ = no_part_transmat
        self.no_part_hmm_model.n_features = 5
        self.no_part_hmm_model.emissionprob_ = emissprob

        # intro
        intro_startprob = np.array(
            [
                0,
                0.1,
                0.8 / 13,
                0.1,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
                0.8 / 13,
            ]
        )
        intro_transmat = np.array([intro_startprob] * 16)

        self.intro_hmm_model = hmm.MultinomialHMM(n_components=16)
        self.intro_hmm_model.startprob_ = intro_startprob
        self.intro_hmm_model.transmat_ = intro_transmat
        self.intro_hmm_model.n_features = 5
        self.intro_hmm_model.emissionprob_ = emissprob

        # breakdown
        breakdown_startprob = np.array(
            [
                0,
                0.7 / 12,
                0.7 / 12,
                0.1,
                0.7 / 12,
                0.7 / 12,
                0.15,
                0.7 / 12,
                0.7 / 12,
                0.7 / 12,
                0.7 / 12,
                0.7 / 12,
                0.7 / 12,
                0.7 / 12,
                0.05,
                0.7 / 12,
            ]
        )

        breakdown_transmat = np.array([breakdown_startprob] * 16)

        self.breakdown_hmm_model = hmm.MultinomialHMM(n_components=16)
        self.breakdown_hmm_model.startprob_ = breakdown_startprob
        self.breakdown_hmm_model.transmat_ = breakdown_transmat
        self.breakdown_hmm_model.n_features = 5
        self.breakdown_hmm_model.emissionprob_ = emissprob

        # buildup
        buildup_startprob = np.array(
            [
                0,
                0.7 / 13,
                0.7 / 13,
                0.1,
                0.7 / 13,
                0.7 / 13,
                0.7 / 13,
                0.2,
                0.7 / 13,
                0.7 / 13,
                0.7 / 13,
                0.7 / 13,
                0.7 / 13,
                0.7 / 13,
                0.7 / 13,
                0.7 / 13,
            ]
        )
        buildup_transmat = np.array([buildup_startprob] * 16)

        self.buildup_hmm_model = hmm.MultinomialHMM(n_components=16)
        self.buildup_hmm_model.startprob_ = buildup_startprob
        self.buildup_hmm_model.transmat_ = buildup_transmat
        self.buildup_hmm_model.n_features = 5
        self.buildup_hmm_model.emissionprob_ = emissprob

        # drop
        drop_startprob = np.array(
            [
                0,
                0.4 / 12,
                0.4 / 12,
                0.4 / 12,
                0.4 / 12,
                0.4 / 12,
                0.4 / 12,
                0.4 / 12,
                0.4 / 12,
                0.4 / 12,
                0.4 / 12,
                0.1,
                0.4 / 12,
                0.4 / 12,
                0.2,
                0.3,
            ]
        )
        drop_transmat = np.array([drop_startprob] * 16)

        self.drop_hmm_model = hmm.MultinomialHMM(n_components=16)
        self.drop_hmm_model.startprob_ = drop_startprob
        self.drop_hmm_model.transmat_ = drop_transmat
        self.drop_hmm_model.n_features = 5
        self.drop_hmm_model.emissionprob_ = emissprob

        # outro
        outro_startprob = np.array(
            [
                0,
                0.6 / 12,
                0.6 / 12,
                0.6 / 12,
                0.1,
                0.6 / 12,
                0.6 / 12,
                0.6 / 12,
                0.15,
                0.6 / 12,
                0.6 / 12,
                0.6 / 12,
                0.15,
                0.6 / 12,
                0.6 / 12,
                0.6 / 12,
            ]
        )
        outro_transmat = np.array([outro_startprob] * 16)

        self.outro_hmm_model = hmm.MultinomialHMM(n_components=16)
        self.outro_hmm_model.startprob_ = outro_startprob
        self.outro_hmm_model.transmat_ = outro_transmat
        self.outro_hmm_model.n_features = 5
        self.outro_hmm_model.emissionprob_ = emissprob

    def useHMM(self, excitement_array):
        """HMMを使用する"""
        observation_data = np.atleast_2d(excitement_array).T
        hmm_array, hmm_array = self.no_part_hmm_model.decode(observation_data)
        return hmm_array

    def useAutoHMM(self, excitement_array):
        """構成を考慮したHMMを使用する"""
        self.section_array = self.dtw(excitement_array)
        # パート毎にリストを用意する
        intro_array = list()
        breakdown_array = list()
        buildup_array = list()
        drop_array = list()
        outro_array = list()

        for i, e in enumerate(excitement_array):
            if self.section_array[i] == 0:
                intro_array.append(e)
            elif self.section_array[i] == 1:
                breakdown_array.append(e)
            elif self.section_array[i] == 2:
                buildup_array.append(e)
            elif self.section_array[i] == 3:
                drop_array.append(e)
            elif self.section_array[i] == 4:
                outro_array.append(e)

        # intro
        intro_data = np.atleast_2d(intro_array).T
        intro_hmm_array, intro_hmm_array = self.intro_hmm_model.decode(intro_data)
        # breakdown
        breakdown_data = np.atleast_2d(breakdown_array).T
        (
            breakdown_hmm_array,
            breakdown_hmm_array,
        ) = self.breakdown_hmm_model.decode(breakdown_data)
        # buildup
        buildup_data = np.atleast_2d(buildup_array).T
        buildup_hmm_array, buildup_hmm_array = self.buildup_hmm_model.decode(
            buildup_data
        )
        # drop
        drop_data = np.atleast_2d(drop_array).T
        drop_hmm_array, drop_hmm_array = self.drop_hmm_model.decode(drop_data)
        # outro
        outro_data = np.atleast_2d(outro_array).T
        outro_hmm_array, outro_hmm_array = self.outro_hmm_model.decode(outro_data)

        return np.concatenate(
            [
                intro_hmm_array,
                breakdown_hmm_array,
                buildup_hmm_array,
                drop_hmm_array,
                outro_hmm_array,
            ]
        )

    def dtw(self, excitement_array):
        """DTWの計算を行う"""
        # セクションは4小節ごとに考慮する
        short_excitement_array = list()
        sum = 0
        for i, e in enumerate(excitement_array, 1):
            if i % 4 == 0 and i != 0:
                short_excitement_array.append(round(sum / 4))
                sum = 0
            sum += e
        excitement_array = short_excitement_array
        # セクションが取るであろう盛り上がり度
        # intro, breakdown + buildup, drop, outro
        section_excitement = [0, 1, 3.3, 0]
        # 2つの時系列の長さ
        excitement_len = len(excitement_array)
        section_len = len(section_excitement)
        # 初期化
        dtw = [
            [float("inf") for i in range(section_len + 1)]
            for j in range(excitement_len + 1)
        ]
        dtw[0][0] = 0
        # 累積を考える
        for i in range(1, excitement_len + 1):
            for j in range(1, section_len + 1):
                cost = abs(excitement_array[i - 1] - section_excitement[j - 1])
                dtw[i][j] = cost + min(dtw[i - 1][j - 1], dtw[i - 1][j])
        # セクションを決定する
        self.section_array = list()
        # 逆から考える
        dtw = dtw[::-1]
        # outroで終わるように調整
        for i in range(4):
            self.section_array.append(4)
        # 最小値を見ながらセクションを決定する
        for d in dtw[1:]:
            # 見る範囲
            start = self.section_array[-1] - 1
            end = self.section_array[-1] + 1
            section = d.index(min(d[start:end]))
            for i in range(4):
                self.section_array.append(section)
        # もとに戻す
        self.section_array = self.section_array[::-1]
        self.section_array = self.section_array[4:]
        self.section_array = [s - 1 for s in self.section_array]
        for i in range(len(self.section_array)):
            if self.section_array[i] == 2 or self.section_array[i] == 3:
                self.section_array[i] += 1
        buildup_start = self.section_array.index(3) - 2
        buildup_end = self.section_array.index(3)
        self.section_array[buildup_start:buildup_end] = [2, 2]

        return self.section_array

    def fixHmm(self, hmm_array, excitement_array):
        """小節毎に揃える"""
        for i in range(len(hmm_array)):
            if i % self.fix_len == 0:
                h = hmm_array[i]
                e = excitement_array[i]
            hmm_array[i] = h
            excitement_array[i] = e
        return hmm_array, excitement_array

    def fixAutoHmm(self, hmm_array, excitement_array, section_array):
        """セクションに合わせて揃える"""
        pre_section = -1
        for i in range(len(hmm_array)):
            if pre_section != section_array[i] or i % self.fix_len == 0:
                h = hmm_array[i]
                e = excitement_array[i]
            hmm_array[i] = h
            excitement_array[i] = e
            pre_section = section_array[i]

        return hmm_array, excitement_array

    def randomChoiceSound(self):
        """音素材をランダムに選択する"""
        random_sound_list = list()
        drums_list = list()
        bass_list = list()
        synth_list = list()
        sequence_list = list()

        for i in range(5):
            drums_file = os.listdir("./TechnoTrance/Drums/" + str(i))
            drums_list.append(
                "./TechnoTrance/Drums/" + str(i) + "/" + random.choice(drums_file)
            )

            bass_file = os.listdir("./TechnoTrance/Bass/" + str(i))
            bass_list.append(
                "./TechnoTrance/Bass/" + str(i) + "/" + random.choice(bass_file)
            )

            synth_file = os.listdir("./TechnoTrance/Synth/" + str(i))
            synth_list.append(
                "./TechnoTrance/Synth/" + str(i) + "/" + random.choice(synth_file)
            )

            sequence_file = os.listdir("./TechnoTrance/Sequence/" + str(i))
            sequence_list.append(
                "./TechnoTrance/Sequence/" + str(i) + "/" + random.choice(sequence_file)
            )

        random_sound_list.append(drums_list)
        random_sound_list.append(bass_list)
        random_sound_list.append(synth_list)
        random_sound_list.append(sequence_list)

        return random_sound_list

    def choiceSound(self, excitement_array, hmm_array):
        """使用する音素材を選択する"""
        sound_list = list()
        for i in range(self.excitement_len):
            binary = format(hmm_array[i], "b").zfill(4)
            binary = binary[::-1]
            excitement = excitement_array[i]
            if i % self.fix_len == 0:
                random_sound_list = self.randomChoiceSound()
            block_sound = list()
            for part in range(4):
                if binary[part] == "1":
                    block_sound.append(random_sound_list[part][excitement])
                else:
                    block_sound.append("null")
            sound_list.append(block_sound)

        return sound_list

    def giveChord(self, sound_list):
        """コードを付与"""
        chord = ["2", "5", "3", "6", "4", "6", "7", "1"]
        for i, sound in enumerate(sound_list, 0):
            for part in range(1, 4):
                sound[part] = re.sub("[0-9].wav", chord[i % 8] + ".wav", sound[part])

        return sound_list

    def connectSound(self, sound_list, projectid):
        """音素材を繋げる"""
        self.output_sound = AudioSegment.silent()
        self.output_sound = self.output_sound[0:0]
        for sound in sound_list:
            block_sound_exist = False
            for s in sound:
                if s != "null":
                    if block_sound_exist:
                        block_sound = block_sound.overlay(AudioSegment.from_file(s))
                    else:
                        block_sound = AudioSegment.from_file(s)
                        block_sound_exist = True

            self.output_sound = self.output_sound + block_sound

        # 楽曲を更新する
        songid = 0
        created = False
        while created == False:
            if (
                os.path.exists("./project/" + projectid + "/songs/" + str(songid))
                == False
            ):
                os.mkdir("./project/" + projectid + "/songs/" + str(songid))
                self.output_sound.export(
                    "./project/"
                    + projectid
                    + "/songs/"
                    + str(songid)
                    + "/song"
                    + str(songid)
                    + ".wav",
                    format="wav",
                )
                created = True
            else:
                songid = songid + 1

        return str(songid)

    def initializationAnalysisMovie(self):
        """動画の分析の初期化"""
        # モーションの残存期間(sec)
        self.DURATION = 1.0
        # 座標毎の方向を計算する間隔
        self.GRID_WIDTH = 40
        # 方向の数を格納する配列の初期化
        self.direction_cnt_array = list()
        # ブロックごとの方向の数を格納する配列の初期化
        self.block_ave_array = list()
        # ブロック内の最大値（方向の数）
        self.block_max = 0
        # 動画の盛り上がり度を格納する配列
        self.motion_excitement_array = list()
        # 進捗の属性
        self.movie_analysis_progress = 0
        self.movie_analysising = True

    def analysisMovie(self, movie_file_path):
        """動画の分析を行う"""
        # 初期化
        self.initializationAnalysisMovie()
        # 動画を読み込む
        self.movie = cv2.VideoCapture(movie_file_path)
        # 動画の幅を取得，分割する幅を決定
        w = self.movie.get(cv2.CAP_PROP_FRAME_WIDTH)
        self.GRID_WIDTH = int(w / 64)
        # 最初のフレームを読み込む
        end_flag, frame_next = self.movie.read()
        count = self.movie.get(cv2.CAP_PROP_FRAME_COUNT)
        height, width, channels = frame_next.shape
        motion_history = np.zeros((height, width), np.float32)
        frame_pre = frame_next.copy()
        # 動画の最後までをwhile文で回す
        entire_count = 0
        while end_flag:
            if self.movie_analysising == False:
                break
            # 次のフレームとの差分を計算する
            color_diff = cv2.absdiff(frame_next, frame_pre)
            # グレースケールに変換
            gray_diff = cv2.cvtColor(color_diff, cv2.COLOR_BGR2GRAY)
            # 2値化
            retval, black_diff = cv2.threshold(gray_diff, 30, 1, cv2.THRESH_BINARY)
            # プロセッサの処理時間を取得する
            proc_time = time.clock()
            # モーション履歴画像を更新する
            cv2.motempl.updateMotionHistory(
                black_diff, motion_history, proc_time, self.DURATION
            )
            # 古いモーションの表示を経過時間に応じて薄くする
            hist_color = np.array(
                np.clip(
                    (motion_history - (proc_time - self.DURATION)) / self.DURATION,
                    0,
                    1,
                )
                * 255,
                np.uint8,
            )
            # グレースケール変換
            hist_gray = cv2.cvtColor(hist_color, cv2.COLOR_GRAY2BGR)
            # モーション履歴画像の変化方向の計算
            mask, orientation = cv2.motempl.calcMotionGradient(
                motion_history, 0.25, 0.05, apertureSize=5
            )
            # ブロックごとに方向を検出した数を計算する
            direction_cnt = 0
            width_i = self.GRID_WIDTH
            while width_i < width:
                height_i = self.GRID_WIDTH
                while height_i < height:
                    angle_deg = orientation[height_i - 1][width_i - 1]
                    if angle_deg > 0:
                        direction_cnt += 1
                    height_i += self.GRID_WIDTH

                width_i += self.GRID_WIDTH
            self.direction_cnt_array.append(direction_cnt)
            entire_count += 1
            self.movie_analysis_progress = entire_count / count * 100
            # 次のフレームの読み込み
            frame_pre = frame_next.copy()
            end_flag, frame_next = self.movie.read()

        if self.movie_analysising:
            self.movie_analysising = False
            self.calcMovieExcitement(self.movie, self.direction_cnt_array)
            print("finish analysising movie")
        else:
            print("cancel analysising movie")

    def calcMovieExcitement(self, movie, direction_cnt_array):
        """動画の盛り上がり度を計算する"""
        # FPSを取得
        fps = movie.get(cv2.CAP_PROP_FPS)
        # 1ブロックあたりの時間算出
        block = int(fps * 3.4)
        block_total = 0
        element_cnt = 1
        # 1ブロック毎の方向を検出した数の平均を計算
        for i in self.direction_cnt_array:
            block_total += i
            if element_cnt % (block) == 0:
                self.block_ave_array.append(int(block_total / block))
                block_total = 0
                element_cnt = 0
            element_cnt += 1
        # 一番盛り上がるところを検出
        self.block_max = max(self.block_ave_array)
        # 盛り上がり度を計算
        for i in self.block_ave_array:
            if self.block_max == 0:
                e = 0
            else:
                e = i / self.block_max
            self.motion_excitement_array.append((e))

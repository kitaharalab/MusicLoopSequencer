import tkinter as tk
from tkinter import ttk
from model import Model
import vlc
import tkinter.messagebox as tkmsg
import os
import time
import concurrent.futures
import sys
from tkinter import filedialog
import cv2

class View(tk.Frame):
    """
    V（表示）
    ボタン，カンバス，動画画面表示
    線の描画

    C（制御）
    ユーザーからのイベント処理
    """

    def __init__(self, master):
        """起動時に呼ばれる関数"""
        super().__init__(master)
        #ウィンドウの生成
        width, height = master.winfo_screenwidth(), master.winfo_screenheight()
        self.master.attributes("-zoomed", "1")
        self.master.title(u"loop")
        self.master.configure(bg="#fff")  
        self.createView(self.master, width, height)
        self.model = Model(self.line_height, self.block_width,
                           self.line_block_height)
        self.createControl()
        self.drawLine()
        #再生の状態
        self.judge_play = False


    def createView(self,master,width,height):
        """それぞれを表示する"""

        #操作を行うフレーム
        operation_width = width*0.2
        operation_height = height
        operation_bg = "#f5f5f5"
        operation_fg = "#000"
        operation_frame = tk.Frame(master,width=operation_width,height=operation_height,bg=operation_bg)
        operation_frame.place(x=0)

        #操作フレームをフレームによって分割する
        control_frame = tk.LabelFrame(operation_frame,text="control",bg=operation_bg,fg=operation_fg)
        control_frame.place(relx=0.5, rely=0.2, anchor="center")
        #--
        option_frame = tk.LabelFrame(operation_frame, text="option",bg=operation_bg,fg=operation_fg)
        option_frame.place(relx=0.5, rely=0.45, anchor="center")
        #--
        analysis_frame = tk.LabelFrame(operation_frame, text="analysis",bg=operation_bg,fg=operation_fg)
        analysis_frame.place(relx=0.5, rely=0.75, anchor="center")
        #ウィジェット生成の関数を呼ぶ
        self.createOpWidget(control_frame,option_frame,analysis_frame)

        #動画の再生を行うフレーム
        movie_width = width*0.6
        movie_height = height*0.5
        movie_bg = "#000"
        self.movie_frame = tk.Frame(master,width=movie_width,height=movie_height,bg=movie_bg)
        self.movie_frame.place(x=operation_width)
        self.createMovieZone(self.movie_frame)

        #描画を行うフレーム
        self.draw_width = width*0.6
        self.draw_height = height*0.5
        draw_bg = "#f5f5f5"
        self.draw_frame = tk.Frame(master,width=self.draw_width,height=self.draw_height,bg=draw_bg)
        self.draw_frame.place(x=operation_width, y=movie_height)
        #描画する場所を生成する関数を呼ぶ
        self.createDrawZone(self.draw_frame)

        #詳細を表示するフレーム
        description_width = width*0.2
        description_height = height
        description_bg = "#f5f5f5"
        description_fg = "#000"
        description_frame = tk.Frame(master,width=description_width,height=description_height,bg=description_bg)
        description_frame.place(x=operation_width+self.draw_width)

        #フレームによって分割
        section_frame = tk.LabelFrame(description_frame,text="section",bg=description_bg,fg=description_fg)
        section_frame.place(relx=0.5, rely=0.3, anchor="center")
        #--
        part_frame = tk.LabelFrame(description_frame,text="part",bg=description_bg,fg=description_fg)
        part_frame.place(relx=0.5, rely=0.7, anchor="center")
        #ウィジェット生成の関数を呼ぶ
        self.createDesWidget(section_frame,part_frame)


    def createOpWidget(self, control_frame, option_frame, analysis_frame):
        """操作フレームにウィジェットを生成する"""

        #属性の定義
        button_width = 5
        padx=(10,10)
        pady=(10,10)
    
        #生成ボタン
        create_button = tk.Button(
            control_frame, text="create", width=button_width,command=self.createMusic)
        create_button.grid(column=1,row=0,padx=padx,pady=pady)
        #再生ボタン
        play_button = tk.Button(
            control_frame, text="play", width=button_width,command=self._playClicked)
        play_button.grid(column=0,row=1,padx=padx,pady=pady)
        # 一時停止ボタン
        pause_button = tk.Button(
            control_frame, text="pause", width=button_width,command=self._pauseClicked)
        pause_button.grid(column=1,row=1,padx=padx,pady=pady)
        #停止ボタン
        stop_button = tk.Button(
            control_frame, text="stop", width=button_width,command = self._stopClicked)
        stop_button.grid(column=3, row=1, padx=padx, pady=pady)
        
        #小節で音素材揃えるボタン郡
        fix_determine_list = [("No fix", 0), ("Fix", 1)]
        self.selected_fix_determine = 0
        self.fix_determine_value = tk.IntVar()
        self.fix_determine_value.set(0)
        count = 0
        for fix_part, val, in fix_determine_list:
            tk.Radiobutton(option_frame, text=fix_part, indicatoron=0,width=10,command=self._fixClicked,
                           variable=self.fix_determine_value, value=val).grid(row=0, column=count,padx=padx, pady=pady)
            count += 1
       
        #構成を変化させるボタン郡
        constitution_determine_list = [("No part", 0), ("Auto", 1)]
        self.selected_constitution_determine = 0
        self.constitution_determine_value = tk.IntVar()
        self.constitution_determine_value.set(0)
        count = 0
        for constitution_part, val, in constitution_determine_list:
            tk.Radiobutton(option_frame, text=constitution_part, indicatoron=0,width=10,command=self._constitutionClicked,
                           variable=self.constitution_determine_value, value=val).grid(row=1, column=count,padx=padx, pady=pady)
            count += 1

        #小節数を増やすボタン
        increase_button= tk.Button(
            option_frame, text="+", width=button_width,command=self._increaseClicked)
        increase_button.grid(column=1, row=2, padx=padx, pady=pady)
        #小節数を減らすボタン
        decrease_button= tk.Button(
            option_frame, text="-", width=button_width,command=self._decreaseClicked)
        decrease_button.grid(column=0, row=2, padx=padx, pady=pady)

        #ファイルを開くボタン
        open_button = tk.Button(
            analysis_frame, text="open", width=button_width,command=self._openClicked)
        open_button.grid(column=0, row=0,columnspan=3, padx=padx, pady=pady)
        #ファイル表示
        self.movie_file = tk.StringVar()
        self.movie_file_path = ""
        movie_file_font = tk.StringVar()
        movie_file_font.set("File>>")
        movie_file_label = tk.Label(
            analysis_frame, textvariable=movie_file_font)
        movie_file_label.grid(row=1,column=0,columnspan=3)
        display_movie_file_= tk.StringVar()
        display_movie_file_entry = tk.Entry(
            analysis_frame, textvariable=self.movie_file, width=40)
        display_movie_file_entry.grid(row=2, column=0,columnspan=3,padx=padx, pady=pady)
        #進捗バー
        # ttkの色を変更
        s = ttk.Style()
        s.theme_use('clam')
        s.configure("red.Horizontal.TProgressbar",
                    foreground='#90ee90', background='#90ee90')
        self.movie_analysis_progress_bar = ttk.Progressbar(
            analysis_frame, style="red.Horizontal.TProgressbar", orient="horizontal", length=300, mode="determinate")
        self.movie_analysis_progress_bar.grid(row=3, column=0,columnspan=3,padx=padx, pady=pady)
        #読み込みボタン
        read_button = tk.Button(
            analysis_frame, text="read", width=button_width,command=self._readClicked)
        read_button.grid(row=4,column=0, padx=padx, pady=pady)
        #キャンセルボタン
        cancel_button = tk.Button(
            analysis_frame, text="cansel", width=button_width,command=self._cancelClicked)
        cancel_button.grid(row=4,column=1, padx=padx, pady=pady)
        #反映ボタン
        reflect_button = tk.Button(
            analysis_frame, text="reflect", width=button_width,command = self._reflectClicked)
        reflect_button.grid(row=4,column=2, padx=padx, pady=pady)

    def createDesWidget(self,section_frame,part_frame):
        """ウィジェットの生成"""
        #属性の定義
        button_width = 5
        padx=(20,20)
        pady=(10,10)

        #セクション
        intro_label = ttk.Label(section_frame,text='intro',background='#d8bfd8',foreground='#ffffff',padding=(20,10))
        intro_label.grid(row=0,column=0,padx=padx, pady=pady)
        breakdown_label = ttk.Label(section_frame,text='beakdown',background='#7b68ee',foreground='#ffffff',padding=(20,10))
        breakdown_label.grid(row=1,column=0,padx=padx, pady=pady)
        buildup_label = ttk.Label(section_frame,text='buildup',background='#4682b4',foreground='#ffffff',padding=(20,10))
        buildup_label.grid(row=2,column=0,padx=padx, pady=pady)
        drop_label = ttk.Label(section_frame,text='drop',background='#191970',foreground='#ffffff',padding=(20,10))
        drop_label.grid(row=3,column=0,padx=padx, pady=pady)
        outro_label = ttk.Label(section_frame,text='outro',background='#d8bfd8',foreground='#ffffff',padding=(20,10))
        outro_label.grid(row=4,column=0,padx=padx, pady=pady)

        #パート
        sequence_label = ttk.Label(part_frame,text='sequence',background='#40e0d0',foreground='#ffffff',padding=(20,10))
        sequence_label.grid(row=0,column=0,padx=padx, pady=pady)
        synth_label = ttk.Label(part_frame,text='synth',background='#7fffd4',foreground='#ffffff',padding=(20,10))
        synth_label.grid(row=1,column=0,padx=padx, pady=pady)
        bass_label = ttk.Label(part_frame,text='bass',background='#afeeee',foreground='#ffffff',padding=(20,10))
        bass_label.grid(row=2,column=0,padx=padx, pady=pady)
        drums_label = ttk.Label(part_frame,text='drums',background='#5f9ea0',foreground='#ffffff',padding=(20,10))
        drums_label.grid(row=3,column=0,padx=padx, pady=pady)


    def createDrawZone(self, draw_frame):
        """描画用画面を生成"""
        #全体の幅
        self.draw_entire_width = self.draw_width
        #全体の高さ
        self.draw_entire_height = self.draw_height*0.87
        
        #カンバスの生成
        self.draw_canvas = tk.Canvas(
            draw_frame, width=self.draw_width, height=self.draw_entire_height, scrollregion=(0, 0, self.draw_entire_width, self.draw_height))
        #スクロールバー
        draw_bar = tk.Scrollbar(draw_frame, orient="horizontal")
        draw_bar.config(command=self.draw_canvas.xview)
        self.draw_canvas.config(xscrollcommand=draw_bar.set)
        #配置
        self.draw_canvas.pack()
        draw_bar.pack(fill="x")

        #背景の生成
        self.createDrawBackground(self.draw_canvas)
       
        # 描画を行うカンバスのバインド設定
        self.draw_canvas.bind("<ButtonPress-1>", self._drawPressed)
        self.draw_canvas.bind("<B1-Motion>", self._drawDragged)

    def createDrawBackground(self, draw_canvas):
        """カンバスの背景を生成"""
        bg = "#f5f5f5"
        fg = "#a9a9a9"

        self.line_height = self.draw_entire_height *0.6
        sound_height = self.draw_entire_height * 0.4
        self.draw_canvas.delete("bg")
        self.block_width = self.draw_width / 32
        self.line_block_height = self.line_height / 5    
        self.sound_block_height = sound_height / 4
        
        #2分割
        self.draw_canvas.create_rectangle(0, 0, self.draw_entire_width, self.line_height, fill=bg,width=0)
        self.draw_canvas.create_rectangle(0, self.line_height, self.draw_entire_width, self.draw_height, fill=bg, width=0)
        
        #ブロック分割
        i = 1
        while self.block_width * i < self.draw_entire_width:
            if i % 4 == 0:
                thickness = 3
            else:
                thickness = 1
            self.draw_canvas.create_line(i*self.block_width, 0, i *self.block_width, self.line_height,
                                        fill=fg, width=thickness, tag="bg")
            i += 1
        thickness=1
        for i in range(6):
            self.draw_canvas.create_line(0, self.line_block_height * i, self.draw_entire_width, i * self.line_block_height,
                                        fill=fg, width=thickness, tag="bg")
        for i in range(4):
            self.draw_canvas.create_line(0, self.line_height + self.sound_block_height * i,
                                        self.draw_entire_width, self.line_height + self.sound_block_height*i,
                                        fill=fg, width=thickness, tag="bg")

    def createMovieZone(self,movie_frame):
        self.movie_canvas = tk.Canvas(
            self.movie_frame, width=self.movie_frame["width"], height=self.movie_frame["height"], bg="black")
        self.movie_canvas.place(relx=0.5, rely=0.5, anchor="center")

        
    def drawLine(self):
        """線の描画"""
        fg = "#6495ed"
        self.draw_canvas.delete("line")
        for i in range(self.pixcel_width - 1):
            self.draw_canvas.create_line(
                i, self.pixcel_array[i], i + 1, self.pixcel_array[i + 1], fill=fg, width=3, tag="line")

    def drawSound(self,hmm_array):
        """挿入された音素材を塗りつぶす"""
        self.draw_canvas.delete("sound")
        bg_list = ["#40e0d0", "#7fffd4", "#afeeee", "#5f9ea0"]
        for i,binary in enumerate(hmm_array,0):
            binary = format(binary, 'b').zfill(4)
            for j,b in enumerate(binary,0):
                if b == "1":
                    self.draw_canvas.create_rectangle(i * self.block_width, self.line_height + self.sound_block_height*j,
                    (i+1) * self.block_width, self.line_height + self.sound_block_height*(j+1), fill=bg_list[j],width=0,tag="sound")

    def drawSeekbar(self):
        """シークバーを表示する"""
        self.seekbar_value = tk.DoubleVar()
        p = self.vlc_sound_player.get_media_player()

        while self.judge_play:
            self.draw_canvas.delete("position")
            # 取得したポジションを利用して描画を行う
            self.draw_canvas.create_line(self.draw_entire_width * p.get_position(), 0, self.draw_entire_width *
                                         p.get_position(), self.draw_entire_height, fill="white", width=3, tag="position")
            # 描画に余裕を持たせるため少し時間を空ける
            time.sleep(0.1)      
        self.draw_canvas.delete("position")

    def displayVProgressOfAnalysis(self):
        """進捗バーの描画"""  
        while self.model.movie_analysising:         
            self.movie_analysis_progress_bar["value"] = self.model.movie_analysis_progress
        print("finish progress")
          
    def matchMovieLength(self,motion_excitement_array):
        """動画の長さに音楽を合わせる"""
        self.movie_excite_len = int(len(motion_excitement_array) / 4) * 4
        self.draw_entire_width = self.block_width * self.movie_excite_len
        self.draw_canvas.config(scrollregion=(
            0, 0, self.draw_entire_width, self.draw_height))
        self.createControl()
        self.createDrawBackground(self.draw_canvas)
        self._constitutionClicked()
        self.draw_canvas.delete("sound")
        self.drawLine()

    def drawMovieLine(self,motion_excitement_array):
        """動画の盛り上がりを曲線にする"""
        count = 0
        for i in range(len(self.pixcel_array)):
            self.pixcel_array[i] = self.line_height - int(self.line_height*motion_excitement_array[count])
            if (i+1) % self.block_width == 0:
                count+=1
        self.drawLine()

    def drawSection(self,section_array):
        """セクションの描画"""
        intro_start = 0
        intro_end = section_array.index(1)
        breakdown_start = section_array.index(1)
        breakdown_end = section_array.index(2)
        buildup_start = section_array.index(2)
        buildup_end = section_array.index(3)
        drop_start = section_array.index(3)
        drop_end = section_array.index(4)
        outro_start = section_array.index(4)
        outro_end = len(section_array)

        #描画
        self.draw_canvas.delete("section")
        self.draw_canvas.create_line(intro_start*self.block_width,self.line_height, intro_end*self.block_width, self.line_height,
                                            fill="#d8bfd8",width = 8,tag="section")
        self.draw_canvas.create_line(breakdown_start*self.block_width,self.line_height, breakdown_end*self.block_width, self.line_height,
                                            fill="#7b68ee",width = 8,tag="section")
        self.draw_canvas.create_line(buildup_start*self.block_width,self.line_height, buildup_end*self.block_width, self.line_height,
                                            fill="#4682b4",width = 8,tag="section")
        self.draw_canvas.create_line(drop_start*self.block_width,self.line_height, drop_end*self.block_width, self.line_height,
                                            fill="#191970",width = 8,tag="section")
        self.draw_canvas.create_line(outro_start*self.block_width,self.line_height, outro_end*self.block_width, self.line_height,
                                            fill="#d8bfd8",width = 8,tag="section")

    """control----------------------------------------------------------------------------"""

    def createControl(self):
        """コントロールオプション"""
        #描画に使用する配列を生成
        self.pixcel_width = int(self.draw_entire_width)
        default = int(self.line_height - 10)
        self.pixcel_array = [default] * self.pixcel_width
        #modelを初期化
        self.model.initializationExcitement(self.pixcel_array)

    def _drawPressed(self, event):
        """マウスをクリックした時"""
        self.sx = int(self.draw_canvas.canvasx(event.x))
        self.sy = event.y if event.y <= self.line_height else self.line_height

        if 0 <= event.x and event.x < self.draw_width and 0 < event.y and event.y < self.line_height:
            self.pixcel_array[self.sx] = event.y

        self.drawLine()
        print(len(self.pixcel_array))

    def _drawDragged(self, event):
        """マウスをドラッグした時"""
        # 線形補間によって描画を行う
        if 0 <= event.x and event.x < self.draw_entire_width and 0 < event.y and event.y < self.line_height and self.sx <= self.draw_entire_width:
            self.pixcel_array[int(
                self.draw_canvas.canvasx(event.x))] = event.y
            difference = int(abs(self.draw_canvas.canvasx(event.x) - self.sx))

            if self.draw_canvas.canvasx(event.x) > self.sx:
                for i in range(1, difference):
                    self.pixcel_array[self.sx+i] = int(self.sy+(event.y-self.sy)
                                                             * (self.sx + i - self.sx) / (self.draw_canvas.canvasx(event.x) - self.sx))
            else:
                for i in range(1, difference):
                    self.pixcel_array[self.sx-i] = int(self.sy+(event.y-self.sy)
                                                             * (self.sx - i - self.sx) / (self.draw_canvas.canvasx(event.x) - self.sx))

        self.drawLine()
        self.sx = int(self.draw_canvas.canvasx(event.x))
        self.sy = event.y if event.y <= self.line_height else self.line_height
        self.sy = event.y if event.y >= 0 else 0
        print(event.y, self.draw_entire_width)

    def createMusic(self, array, projectid):
        """楽曲の生成"""
        #盛り上がり度を求める
        #self.excitement_array = self.model.chengeExcitement(array)
        #状態を求める
        if self.selected_constitution_determine == 0:
            self.hmm_array = self.model.useHMM(array)
        else:
            self.hmm_array = self.model.useAutoHMM(array)
        if self.selected_fix_determine == 1:
            if self.selected_constitution_determine == 0:
                self.hmm_array,array = self.model.fixHmm(self.hmm_array,array)
            else:
                self.hmm_array,array = self.model.fixAutoHmm(self.hmm_array,array,self.model.section_array)
        #音素材を繋げる
        self.sound_list = self.model.choiceSound(array, self.hmm_array)
        #コードを付与する
        self.sound_list = self.model.giveChord(self.sound_list)
        #音素材を繋げる
        songid = self.model.connectSound(self.sound_list, projectid)
        #描画を行う
        #self.drawSound(self.hmm_array)
        #if self.selected_constitution_determine == 1:
        #    self.drawSection(self.model.section_array)
        #else:
        #    self.draw_canvas.delete("section")
        #再生の準備を行う
        #self.vlc_sound_player = vlc.MediaListPlayer()

        return self.sound_list, songid
    
    def playMusic(self):
        """生成した楽曲を生成する"""    
        music_media_list = vlc.MediaList(["./TechnoTrance/output.wav"])
        self.vlc_sound_player.set_media_list(music_media_list)   
        self.vlc_sound_player.play()
        

    def pauseMusic(self):
        """楽曲の一時停止"""
        self.vlc_sound_player.pause()

    def stopMusic(self):
        """楽曲の停止"""
        self.vlc_sound_player.stop()

    def playMovie(self):
        """動画の再生"""
        if self.movie_file_path != "":
            #初期化
            self.vlc_instance = vlc.Instance("--no-xlib")
            self.vlc_movie_player = self.vlc_instance.media_player_new()
            self.vlc_movie_player.set_xwindow(self.movie_frame.winfo_id())
            #ファイル選択
            dirname = os.path.dirname(self.movie_file_path)
            filename = os.path.basename(self.movie_file_path)
            media = self.vlc_instance.media_new(str(os.path.join(dirname, filename)))
            self.vlc_movie_player.set_media(media)
            self.vlc_movie_player.audio_set_volume(0)
            self.vlc_movie_player.play()
        else:
            print("not movie")

    def pauseMovie(self):
        """動画の一時停止"""
        if self.movie_file_path != "":
            self.vlc_movie_player.pause()

    def stopMovie(self):
        """動画の停止"""
        if self.movie_file_path != "":
            self.vlc_movie_player.stop()
    
    """button----------------------------------------------------------------------------"""

    def _increaseClicked(self):
        """小節数を増やすボタンが押された時"""
        self.draw_entire_width += self.block_width * 4
        self.draw_canvas.config(scrollregion=(
            0, 0, self.draw_entire_width, self.draw_height))
        self.createControl()
        self.createDrawBackground(self.draw_canvas)
        self._constitutionClicked()
        self.draw_canvas.delete("sound")
        self.drawLine()

    def _decreaseClicked(self):
        """小節数を減らすボタンが押された時"""
        if self.draw_entire_width > 0:
            self.draw_entire_width -= self.block_width * 4
            self.draw_canvas.config(scrollregion=(
                0, 0, self.draw_entire_width, self.draw_height))
            self.createControl()
            self.createDrawBackground(self.draw_canvas)
            self._constitutionClicked()
            self.draw_canvas.delete("sound")
            self.drawLine()

    def _playClicked(self):
        """再生ボタンが押された時"""
        if os.path.exists("./TechnoTrance/output.wav"):
            self.judge_play = True
            play_executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)
            play_executor.submit(self.playMusic)
            play_executor.submit(self.drawSeekbar)
            play_executor.submit(self.playMovie)
        else:
            tkmsg.showerror(title="error",message="Push the create button or return key")

    def _pauseClicked(self):
        """一時停止ボタンが押された時"""
        if self.judge_play:
            self.pauseMusic()
            self.pauseMovie()
        else:
            tkmsg.showerror(title="error",message="Push the play button")

    def _stopClicked(self):
        """停止ボタンが押された時"""
        if self.judge_play:
            self.stopMusic()
            self.stopMovie()
            self.judge_play = False
        else:
            tkmsg.showerror(title="error",message="Push the play button")

    def _openClicked(self):
        """ファイルを開くボタンが押されたとき"""
        fTyp = [("", "*")]
        iDir = iDir = "/home/yasusaka/Document/desktopLoop/Movie/"
        self.movie_file_path = filedialog.askopenfilename(
            filetypes=fTyp, initialdir=iDir)
        # ストリングバーにセット
        self.movie_file.set(self.movie_file_path)

    def _readClicked(self):
        """読み込みボタンが押されたとき"""
        if self.movie_file_path != "":
            read_executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)
            read_executor.submit(self.model.analysisMovie,movie_file_path=self.movie_file_path)
            read_executor.submit(self.displayVProgressOfAnalysis)      
        else:
            tkmsg.showerror(title="error",message="Choise movie file")

    def _cancelClicked(self):
        """キャンセルボタンが押されたとき"""
        self.model.movie_analysising = False    
        self.movie_analysis_progress_bar["value"] = 0

    def _reflectClicked(self):
        """反映ボタンが押されたとき"""
        if len(self.model.motion_excitement_array) >= 4:
            self.matchMovieLength(self.model.motion_excitement_array)
            self.drawMovieLine(self.model.motion_excitement_array)
        else:
            tkmsg.showerror(title="error",message="not movie file or movie too short")
        self.createMusic()

    def _constitutionClicked(self):
        """構成変更ボタンが押されたとき"""
        self.selected_constitution_determine = self.constitution_determine_value.get()
        if self.draw_entire_width/self.block_width < 16:
            self.constitution_determine_value.set(0)
    
    def _fixClicked(self):
        """揃えるボタンが押されたとき"""
        self.selected_fix_determine = self.fix_determine_value.get()
     


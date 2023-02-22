import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPos } from './redux/blockSlice';
import { setCanvas } from './redux/blockCanvasSlice';
import axios from 'axios';



export default function createMusic(canvas, linesY) {
    let excitement_array = new Array(32);
    for (let i = 0; i < 32; i++) {
        //１ブロックの範囲を決定
        const block_start = Math.floor(i * 36)
        const block_finish = Math.floor(block_start + 36)
        //ブロックの合計から平均を計算
        let block_total = 0
        for (let j = block_start; j < block_finish; j++) {
            block_total += Math.abs((linesY[j] - 282))


            excitement_array[i] = Math.floor(
                block_total / 36 / 56);
        }
    }
    console.log("button pushed")
    const url = "http://127.0.0.1:5000/projects/0/songs";

    const data = {
        curves: excitement_array      //盛り上がり度曲線のパラメーターを格納した配列をJSONデータにする
    };

    axios.post(url, data)       //サーバーから音素材の配列を受け取った後，then部分を実行する．
        .then(function (response) {
            const songid = response.data.songid
            let sequence_list = new Array(32);
            let synth_list = new Array(32);
            let bass_list = new Array(32);
            let drums_list = new Array(32);

            sequence_list = response.data.parts[0].sounds
            synth_list = response.data.parts[1].sounds
            bass_list = response.data.parts[2].sounds
            drums_list = response.data.parts[3].sounds
            canvas.clearRect(0, 0, canvas.width, canvas.height);
            canvas.strokeRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 4; i++) {
                const color = "";
                if (i == 0) {
                    canvas.fillStyle = "red";
                } else if (i == 1) {
                    canvas.fillStyle = "yellow";
                } else if (i == 2) {
                    canvas.fillStyle = "green";
                } else {
                    canvas.fillStyle = "blue";
                }
                for (let j = 0; j < 32; j++) {
                    if (i == 0) {
                        if (sequence_list[j] != null) {
                            canvas.fillRect(j * 36, i * 50, 36, 50);
                        }
                    } else if (i == 1) {
                        if (synth_list[j] != null) {
                            canvas.fillRect(j * 36, i * 50, 36, 50);
                        }
                    } else if (i == 2) {
                        if (bass_list[j] != null) {
                            canvas.fillRect(j * 36, i * 50, 36, 50);
                        }
                    } else {
                        if (drums_list[j] != null) {
                            canvas.fillRect(j * 36, i * 50, 36, 50);
                        }
                    }
                    canvas.fill();
                }
            }
            for (let i = 0; i < 32; i++) {
                for (let j = 0; j < 4; j++) {
                    canvas.strokeRect(i * 36, j * 50, 36, 50);
                }
            }
            canvas.fill();
        });
}
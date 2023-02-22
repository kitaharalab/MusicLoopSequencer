import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPos } from './redux/soundsSlice';
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

    return axios.post(url, data)       //サーバーから音素材の配列を受け取った後，then部分を実行する．
        .then(function (response) {

            return response.data;
        });
}
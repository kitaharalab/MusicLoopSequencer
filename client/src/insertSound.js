import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPos } from './redux/soundsSlice';
import { setCanvas } from './redux/blockCanvasSlice';
import axios from 'axios';



export default function insertSound(projectId, partId, measureId, musicLoopId, parts) {
    console.log("asdfl;kjqwerpoiuasdf;ljqwerpoiu")
    const url = "http://127.0.0.1:5000//projects/" + String(projectId) + "/parts/" + String(partId) + "/measures/" + String(measureId) + "/musicloops/" + String(musicLoopId)
    console.log(parts)
    const sequenceList = parts[0].sounds
    const synthList = parts[1].sounds
    const bassList = parts[2].sounds
    const drumsList = parts[3].sounds

    const data = {
        sequenceList: sequenceList,
        synthList: synthList,
        bassList: bassList,
        drumsList: drumsList      //盛り上がり度曲線のパラメーターを格納した配列をJSONデータにする
    };

    return axios.post(url, data)       //サーバーから音素材の配列を受け取った後，then部分を実行する．
        .then(function (response) {
            return response.data;
        });
}
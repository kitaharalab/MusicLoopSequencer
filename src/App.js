import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import useSound from 'use-sound';
import Sound from "./song0.wav";
import ExcitementCurve from './ExcitementCurve';

function App() {
  const [context1, setContext1] = useState(null)
  const [audio, setAudio] = useState(null);
  const [context2, setContext2] = useState(null)
  const [drawing, setDrawing] = useState(false);
  const [dammy, setDammy] = useState(0);
  const [count, setCount] = useState(0);
  const [numberi, setNumberi] = useState(0);
  const [temps, setTemp] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [linesY, setLinesY] = useState([])
  const [asdf, setasdf] = useState([0])
  const [ctx2Width, setCtx2Width] = useState(0)
  const [ctx2Height, setCtx2Height] = useState(0)
  const [songId, setSongId] = useState(0);
  let [play, { stop, pause }] = useSound(Sound);



  const clickRect = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    let posRectX = Math.floor(offsetX / 36);
    let posRectY = Math.floor(offsetY / 50);
    context2.clearRect(0, 0, ctx2Width, ctx2Height);
    context2.strokeRect(0, 0, ctx2Width, ctx2Height);
    context2.fill()
    context2.lineWidth = 6;
    context2.strokeRect(36 * posRectX, 50 * posRectY, 36, 50);
    context2.fill();
    context2.lineWidth = 1;
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 4; j++) {
        context2.strokeRect(36 * i, 50 * j, 36, 50);
      }
    }
    let newCount = posRectX + posRectY;

    setCount(newCount);
  };


  const test = () => {
    const test1 = new Audio(Sound)
    setCount(count + 1)
    test1.play();
  }

  const createMusic = () => {
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
    setCount(excitement_array)
    const url = "http://127.0.0.1:5000//projects/0/songs";

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
        context2.clearRect(0, 0, ctx2Width, ctx2Height);
        context2.strokeRect(0, 0, ctx2Width, ctx2Height);
        for (let i = 0; i < 4; i++) {
          const color = "";
          if (i == 0) {
            context2.fillStyle = "red";
          } else if (i == 1) {
            context2.fillStyle = "yellow";
          } else if (i == 2) {
            context2.fillStyle = "green";
          } else {
            context2.fillStyle = "blue";
          }
          for (let j = 0; j < 32; j++) {
            if (i == 0) {
              if (sequence_list[j] != null) {
                context2.fillRect(j * 36, i * 50, 36, 50);
              }
            } else if (i == 1) {
              if (synth_list[j] != null) {
                context2.fillRect(j * 36, i * 50, 36, 50);
              }
            } else if (i == 2) {
              if (bass_list[j] != null) {
                context2.fillRect(j * 36, i * 50, 36, 50);
              }
            } else {
              if (drums_list[j] != null) {
                context2.fillRect(j * 36, i * 50, 36, 50);
              }
            }
            context2.fill();
          }
        }
        for (let i = 0; i < 32; i++) {
          for (let j = 0; j < 4; j++) {
            context2.strokeRect(i * 36, j * 50, 36, 50);
          }
        }
        context2.fill();
      });
  }

  useEffect(() => {
    const canvas1 = document.getElementById('canvas1');
    const ctx1 = canvas1.getContext('2d');
    const canvas2 = document.getElementById('canvas2');
    const ctx2 = canvas2.getContext('2d');
    setCtx2Width(canvas2.width)
    setCtx2Height(canvas2.height)
    setContext1(ctx1);
    setContext2(ctx2);
    let array = new Array(1152);
    for (var i = 0; i < 1152; i++) {
      array[i] = 250;
    }
    setLinesY(array)
    ctx1.fillStyle = 'green';
    ctx1.fillStyle = 'black';
    ctx1.strokeStyle = "black"
    ctx1.lineWidth = "3"
    ctx1.strokeRect(0, 0, canvas1.width, canvas1.height);
    ctx1.strokeStyle = "gray";
    ctx1.lineWidth = "1"
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 5; j++) {
        ctx1.strokeRect(36 * i, 56 * j, 36, 56);
      }
    }
    ctx1.lineWidth = "3";
    ctx1.strokeStyle = "blue"
    ctx1.beginPath();
    for (var i = 0; i < 1151; i++) {
      ctx1.moveTo(i, 250);      //盛り上がり度曲線を描く
      ctx1.lineTo(i + 1, 250);
    }
    ctx1.stroke();
    ctx1.closePath();
    setCount(0)
    ctx2.strokeRect(0, 0, canvas2.width, canvas2.height);
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 4; j++) {
        ctx2.strokeRect(i * 36, j * 50, 36, 50);
      }
    }
    const url1 = "http://127.0.0.1:5000/projects/0/songs/0/wav";

    axios.get(url1, { responseType: 'blob', })       //サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then(function (response) {
        var FILE = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }));
        const newCount = count + 1;
        setCount(FILE)
        const test1 = new Audio(FILE);
        setAudio(test1)
      });
    const url2 = "http://127.0.0.1:5000/projects/0/songs"
    const temp2 = 0
    axios.get(url2)       //サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then(function (response) {
        setasdf(1234)
        temp2 = response.data.songids[response.data.songids.length - 1]
      });
    var select = document.getElementById("number")
    for (let i = 0; i <= temp2; i++) {
      select.add(new Option(String(i), String(i)));
    }
  }, [dammy]);

  const test1 = context => {
    context.pause();
    context.currentTime = 0;
  }



  const addSelect = () => {
    var select = document.getElementById("number")
    select.add(new Option('a', '1'));
  }

  const handleChange = (e) => {
    setasdf(e.target.value)
  }

  return (
    <>
      <p>count: <code id='count'>{linesY}</code></p>
      <p>count: <code id='count'>{temps}</code></p>
      <p>count: <code id='count'>{count}</code></p>
      <p>count: <code id='count'>{numberi}</code></p>
      <p>count: <code id='count'>{asdf}</code></p>
      <p>count: <code id='count'>{songId}</code></p>
      <select id="number" onChange={handleChange}>
      </select>
      <button type="button" onClick={() => audio.play()}>play</button>
      <button type="button" onClick={() => audio.pause()}>pause</button>
      <button type="button" onClick={() => { audio.pause(); audio.currentTime = 0 }}>stop</button>
      <button type='button' onClick={() => createMusic()}>create</button>
      <button type="button" onClick={() => addSelect()}>add</button>
      <h1>asdf</h1>
      <div className='excitement-curve-container'>
        <ExcitementCurve />
      </div>
      <h1>qwer</h1>
      <div className='sound-sequence-container'>
        <canvas width="1152" height="200" id="canvas2" onMouseDown={clickRect}></canvas>
      </div>
    </>
  );
}

export default App;

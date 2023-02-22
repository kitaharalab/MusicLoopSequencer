import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStart, setDraw } from './redux/linesSlice';
import axios from 'axios';
import useSound from 'use-sound';
import Sound from "./song0.wav";
import ExcitementCurve from './ExcitementCurve';
import SoundBlock from './SoundBlock';
import createMusic from './createMusic';
import { setCanvas } from './redux/blockCanvasSlice';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { Link, useSearchParams } from "react-router-dom";

function App() {
  const [searchParams] = useSearchParams();
  const projectid = searchParams.get("projectid")
  const linesY = useSelector((state) => state.lines1.lines);
  const aaa = useSelector((state) => state.canvas.canvas);
  const dispatch = useDispatch();
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
  const [done1, setDone] = useState(false);

  const [asdf, setasdf] = useState([0])
  const [ctx2Width, setCtx2Width] = useState(0)
  const [ctx2Height, setCtx2Height] = useState(0)
  const [songId, setSongId] = useState(0);
  let [play, { stop, pause }] = useSound(Sound);

  console.log("projectID:" + String(projectid));



  const test = () => {
    const test1 = new Audio(Sound)
    setCount(count + 1)
    test1.play();
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
    const url2 = "http://127.0.0.1:5000/projects/" + String(projectid) + "/songs"
    let temp2 = 0
    axios.get(url2)       //サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then(function (response) {
        setasdf(1234)
        temp2 = response.data.songids[response.data.songids.length - 1]
        console.log(temp2)
        let select = document.getElementById("number")
        if (done1 == false) {
          for (let i = 0; i <= temp2; i++) {
            select.add(new Option(String(i), String(i)));
          }
        }
        setDone(true);
      });
  }, []);

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
      <Link to={'/'}>Back</Link>
      <select id="number" onChange={handleChange}>
      </select>
      <button type="button" onClick={() => audio.play()}>play</button>
      <button type="button" onClick={() => audio.pause()}>pause</button>
      <button type="button" onClick={() => { audio.pause(); audio.currentTime = 0 }}>stop</button>
      <button type='button' onClick={() => createMusic(aaa, linesY)}>create</button>
      <button type="button" onClick={() => addSelect()}>add</button>
      <h1>asdf</h1>
      <div className='excitement-curve-container'>
        <ExcitementCurve />
      </div>
      <h1>qwer</h1>
      <div className='sound-sequence-container'>
        <SoundBlock />
      </div>
    </>
  );
}

export default App;
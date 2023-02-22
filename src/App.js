import './App.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import useSound from 'use-sound';
import Sound from "./song0.wav";
import ExcitementCurve from './ExcitementCurve';
import SoundBlock from './SoundBlock';
import createMusic from './createMusic';
import { setParts } from './redux/soundsSlice';
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
  const [count, setCount] = useState(0);
  const [done1, setDone] = useState(false);

  const [asdf, setasdf] = useState([0])
  const [ctx2Width, setCtx2Width] = useState(0)
  const [ctx2Height, setCtx2Height] = useState(0)
  let [play, { stop, pause }] = useSound(Sound);

  console.log("projectID:" + String(projectid));





  useEffect(() => {

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
      <button type='button' onClick={async () => {
        const music = await createMusic(aaa, linesY)
        dispatch(setParts(music.parts))
      }}>create</button>
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
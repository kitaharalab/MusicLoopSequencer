import './App.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import useSound from 'use-sound';
import Sound from "./song0.wav";
import ExcitementCurve from './ExcitementCurve';
import SoundBlock from './SoundBlock';
import MusicLoops from './MusicLoops';
import createMusic from './createMusic';
import { setParts } from './redux/soundsSlice';
import { setProjectId } from './redux/projectIdSlice';
import { setId } from './redux/songIdSlice';
import { Link, useSearchParams } from "react-router-dom";

function App() {
  const [searchParams] = useSearchParams();

  const json = useSelector((state) => state.soundData.json)
  const musicLoopId = useSelector((state) => state.musicLoop.musicLoopId)
  const measureId = useSelector((state) => state.canvas.measureId)
  const parts = useSelector((state) => state.sounds.parts)
  const songid = useSelector((state) => state.songId.songId)
  const partId = useSelector((state) => state.canvas.partId)
  const projectid = searchParams.get("projectid")
  const linesY = useSelector((state) => state.lines1.lines);
  const xCoordinate = useSelector((state) => state.musicData.xCoordinate)
  const yCoordinate = useSelector((state) => state.musicData.yCoordinate)
  const rangeList = useSelector((state) => state.musicData.rangeList)
  const dispatch = useDispatch();
  dispatch(setProjectId(projectid))
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

  useEffect(() => {
    if (songid === 0) {
      return;
    }
    const url1 = "http://127.0.0.1:5000/projects/" + String(projectid) + "/songs/" + String(songid) + "/wav";

    axios.get(url1, { responseType: 'blob', })       //サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then(function (response) {
        var FILE = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }));
        const newCount = count + 1;
        setCount(FILE)
        const test1 = new Audio(FILE);
        setAudio(test1)
      });
    let select = document.getElementById("number")
    select.add(new Option(String(songid), String(songid)));
  }, [songid]);

  const addSelect = () => {
    var select = document.getElementById("number")
    select.add(new Option('a', '1'));
  }

  const handleChange = (e) => {
    setasdf(e.target.value)
  }

  return (
    <>
      <p>curve: <code id='count'>{json.curve}</code></p>
      <p>partid: <code id='count'>{json.sounds[0].partid}</code></p>
      <p>measure: <code id='count'>{json.sounds[0].measure}</code></p>
      <p>soundid: <code id='count'>{json.sounds[0].soundId}</code></p>
      <p>partid: <code id='count'>{json.sounds[1].partid}</code></p>
      <p>measure: <code id='count'>{json.sounds[1].measure}</code></p>
      <p>soundid: <code id='count'>{json.sounds[1].soundId}</code></p>
      <p>soundid: <code id='count'>{musicLoopId}</code></p>
      <Link to={'/'}>Back</Link>
      <select id="number" onChange={handleChange}>
      </select>
      <button type="button" onClick={() => audio.play()}>play</button>
      <button type="button" onClick={() => audio.pause()}>pause</button>
      <button type="button" onClick={() => { audio.pause(); audio.currentTime = 0 }}>stop</button>
      <button type='button' onClick={async () => {
        const music = await createMusic(projectid, linesY)
        dispatch(setParts(music.parts))
        dispatch(setId(music.songid))
      }}>create</button>
      <button type="button" onClick={() => addSelect()}>add</button>
      <div className='excitement-curve-container'>
        <ExcitementCurve />
      </div>
      <div className='sound-sequence-container'>
        <SoundBlock />
      </div>
      <div className='music-loops-container'>
        <MusicLoops />
      </div>
    </>
  );
}

export default App;

//<p>curve: <code id='count'>{json.curve}</code></p>
//      <p>partid: <code id='count'>{json.sounds[0].partid}</code></p>
//      <p>measure: <code id='count'>{json.sounds[0].measure}</code></p>
//      <p>soundid: <code id='count'>{json.sounds[0].soundId}</code></p>
//      <p>partid: <code id='count'>{json.sounds[1].partid}</code></p>
//      <p>measure: <code id='count'>{json.sounds[1].measure}</code></p>
//      <p>soundid: <code id='count'>{json.sounds[1].soundId}</code></p>

//<div className='music-loops-container'>
//        <MusicLoops />
//      </div>
//<p>count: <code id='count'>{linesY}</code></p>
//<p>count: <code id='count'>{linesY}</code></p>
//<p>count: <code id='count'>{measureId}</code></p>
//      <p>count: <code id='count'>{partId}</code></p>
//      <p>count: <code id='count'>{musicLoopId}</code></p>

//<p>curve: <code id='count'>{json.curve}</code></p>
//      <p>partid: <code id='count'>{json.sounds[0].partid}</code></p>
//      <p>measure: <code id='count'>{json.sounds[0].measure}</code></p>
//      <p>soundid: <code id='count'>{json.sounds[0].soundId}</code></p>
//      <p>partid: <code id='count'>{json.sounds[1].partid}</code></p>
//      <p>measure: <code id='count'>{json.sounds[1].measure}</code></p>
//      <p>soundid: <code id='count'>{json.sounds[1].soundId}</code></p>

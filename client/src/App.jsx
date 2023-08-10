import "./App.css";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import useSound from "use-sound";
import { Link, useSearchParams } from "react-router-dom";
import Sound from "./song0.wav";
import ExcitementCurve from "./ExcitementCurve";
import SoundBlock from "./SoundBlock";
import MusicLoops from "./MusicLoops";
import createMusic from "./createMusic";
import { setParts } from "./redux/soundsSlice";
import { setProjectId } from "./redux/projectIdSlice";
import { setId } from "./redux/songIdSlice";

function App() {
  const [searchParams] = useSearchParams();

  const json = useSelector((state) => state.soundData.json);
  const musicLoopId = useSelector((state) => state.musicLoop.musicLoopId);
  // const measureId = useSelector((state) => state.canvas.measureId);
  // const parts = useSelector((state) => state.sounds.parts);
  const songid = useSelector((state) => state.songId.songId);
  // const partId = useSelector((state) => state.canvas.partId);
  const projectid = searchParams.get("projectid");
  const linesY = useSelector((state) => state.lines1.lines);
  // const xCoordinate = useSelector((state) => state.musicData.xCoordinate);
  // const yCoordinate = useSelector((state) => state.musicData.yCoordinate);
  // const rangeList = useSelector((state) => state.musicData.rangeList);
  const dispatch = useDispatch();
  dispatch(setProjectId(projectid));
  const [_context1, _setContext1] = useState(null);
  const [audio, setAudio] = useState(null);
  const [_context2, _setContext2] = useState(null);
  const [_count, setCount] = useState(0);
  const [done1, setDone] = useState(false);

  const [_asdf, setasdf] = useState([0]);
  const [_ctx2Width, _setCtx2Width] = useState(0);
  const [_ctx2Height, _setCtx2Height] = useState(0);
  const [_play, { _stop, _pause }] = useSound(Sound);

  console.log(`projectID:${String(projectid)}`);

  useEffect(() => {
    const url2 = `http://127.0.0.1:8080/projects/${String(projectid)}/songs`;
    let temp2 = 0;
    axios
      .get(url2) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        setasdf(1234);
        temp2 = response.data.songids[response.data.songids.length - 1];
        console.log(temp2);
        const select = document.getElementById("number");
        if (done1 === false) {
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
    const url1 = `http://127.0.0.1:8080/projects/${String(
      projectid,
    )}/songs/${String(songid)}/wav`;

    axios
      .get(url1, { responseType: "blob" }) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const FILE = window.URL.createObjectURL(
          new Blob([response.data], { type: "audio/wav" }),
        );
        // const newCount = count + 1;
        setCount(FILE);
        const test1 = new Audio(FILE);
        setAudio(test1);
      });
    const select = document.getElementById("number");
    select.add(new Option(String(songid), String(songid)));
  }, [songid]);

  const addSelect = () => {
    const select = document.getElementById("number");
    select.add(new Option("a", "1"));
  };

  const handleChange = (e) => {
    setasdf(e.target.value);
  };

  return (
    <>
      <p>
        curve: <code id="count">{json.curve}</code>
      </p>
      <p>
        partid: <code id="count">{json.sounds[0].partid}</code>
      </p>
      <p>
        measure: <code id="count">{json.sounds[0].measure}</code>
      </p>
      <p>
        soundid: <code id="count">{json.sounds[0].soundId}</code>
      </p>
      <p>
        partid: <code id="count">{json.sounds[1].partid}</code>
      </p>
      <p>
        measure: <code id="count">{json.sounds[1].measure}</code>
      </p>
      <p>
        soundid: <code id="count">{json.sounds[1].soundId}</code>
      </p>
      <p>
        soundid: <code id="count">{musicLoopId}</code>
      </p>
      <Link to="/">Back</Link>
      <form>
        <select
          id="number"
          onChange={handleChange}
          aria-label="select another"
        />

        <button type="button" onClick={() => audio.play()}>
          play
        </button>
        <button type="button" onClick={() => audio.pause()}>
          pause
        </button>
        <button
          type="button"
          onClick={() => {
            audio.pause();
            audio.currentTime = 0;
          }}
        >
          stop
        </button>
        <button
          type="button"
          onClick={async () => {
            const music = await createMusic(projectid, linesY);
            dispatch(setParts(music.parts));
            dispatch(setId(music.songid));
          }}
        >
          create
        </button>
        <button type="button" onClick={() => addSelect()}>
          add
        </button>
      </form>
      <div className="excitement-curve-container">
        <ExcitementCurve />
      </div>
      <div className="sound-sequence-container">
        <SoundBlock />
      </div>
      <div className="music-loops-container">
        <MusicLoops />
      </div>
    </>
  );
}

export default App;

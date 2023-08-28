import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import useSound from "use-sound";
import { useSearchParams } from "react-router-dom";
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  FormControl,
  Select,
  Button,
  ButtonGroup,
  Box,
} from "@chakra-ui/react";

import ButtonLink from "../components/Link/ButtonLink";
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
  const songId = useSelector((state) => state.songId.songId);
  // const partId = useSelector((state) => state.canvas.partId);
  const projectId = searchParams.get("projectid");
  const linesY = useSelector((state) => state.lines1.lines);
  // const xCoordinate = useSelector((state) => state.musicData.xCoordinate);
  // const yCoordinate = useSelector((state) => state.musicData.yCoordinate);
  // const rangeList = useSelector((state) => state.musicData.rangeList);
  const dispatch = useDispatch();
  dispatch(setProjectId(projectId));
  const [_context1, _setContext1] = useState(null);
  const [audio, setAudio] = useState(null);
  const [_context2, _setContext2] = useState(null);
  const [_count, setCount] = useState(0);
  const [_done1, setDone] = useState(false);

  const [_asdf, setasdf] = useState([0]);
  const [_ctx2Width, _setCtx2Width] = useState(0);
  const [_ctx2Height, _setCtx2Height] = useState(0);
  const [_play, { _stop, _pause }] = useSound(Sound);

  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const url = `${
      import.meta.env.VITE_SERVER_URL
    }/projects/${projectId}/songs`;
    axios
      .get(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        setasdf(1234);
        const resSongIds = response.data.songids;
        setSongs(resSongIds.map((id) => ({ name: id, id })));
        setDone(true);
      });
  }, []);

  useEffect(() => {
    if (songId === 0) {
      return;
    }
    const url = `${
      import.meta.env.VITE_SERVER_URL
    }/projects/${projectId}/songs/${songId}/wav`;

    axios
      .get(url, { responseType: "blob" }) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const FILE = window.URL.createObjectURL(
          new Blob([response.data], { type: "audio/wav" }),
        );
        // const newCount = count + 1;
        setCount(FILE);
        const test1 = new Audio(FILE);
        setAudio(test1);
      });
    setSongs([...songs, { name: songId, id: songId }]);
  }, [songId]);

  const addSelect = () => {
    setSongs([...songs, { name: "a", id: 1 }]);
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
      <ButtonLink to="/">Back to Project</ButtonLink>
      <FormControl>
        <Select
          id="number"
          onChange={handleChange}
          aria-label="select another"
          w="25%"
        >
          {songs.map(({ name, id }) => (
            <option key={`${name}${id}`}>{name}</option>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <ButtonGroup>
          <Button type="button" onClick={() => audio.play()}>
            play
          </Button>
          <Button type="button" onClick={() => audio.pause()}>
            pause
          </Button>
          <Button
            type="button"
            onClick={() => {
              audio.pause();
              audio.currentTime = 0;
            }}
          >
            stop
          </Button>
          <Button
            type="button"
            onClick={async () => {
              const music = await createMusic(projectId, linesY);
              dispatch(setParts(music.parts));
              dispatch(setId(music.songid));
            }}
          >
            create
          </Button>
          <Button type="button" onClick={() => addSelect()}>
            add
          </Button>
        </ButtonGroup>
      </FormControl>
      <Box className="excitement-curve-container" height="25vh" marginY={4}>
        <ExcitementCurve />
      </Box>
      <Box className="sound-sequence-container" marginY={4}>
        <SoundBlock />
      </Box>
      <Box className="music-loops-container">
        <MusicLoops />
      </Box>
    </>
  );
}

export default App;

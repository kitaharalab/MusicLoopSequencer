import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import useSound from "use-sound";
import { useSearchParams } from "react-router-dom";
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  FormControl,
  Select,
  Box,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spacer,
  Grid,
  GridItem,
} from "@chakra-ui/react";

import Sound from "./song0.wav";
import ExcitementCurve from "./app/excitementCurve/ExcitementCurve";
import LoopTable from "./app/musicEdit/LoopTable";
import LoopMaterialView from "./app/musicEdit/loopMaterisl/LoopMaterialView";
import { setParts } from "./redux/soundsSlice";
import { setProjectId } from "./redux/projectIdSlice";
import TopicView from "./app/musicEdit/topic/TopicView";
import Controls from "./app/controls/Controls";
import Header from "./app/Header";
import ZoomedExcitementCurve from "./app/musicEdit/ZoomedExcitementCurve";
import MusicInstrumentTable from "./app/musicEdit/MusicInstrumentTable";

function App() {
  const [searchParams] = useSearchParams();

  const json = useSelector((state) => state.soundData.json);
  const musicLoopId = useSelector((state) => state.musicLoop.musicLoopId);
  // const measureId = useSelector((state) => state.canvas.measureId);
  // const parts = useSelector((state) => state.sounds.parts);
  const songId = useSelector((state) => state.songId.songId);
  // const partId = useSelector((state) => state.canvas.partId);
  const projectId = searchParams.get("projectid");
  // const xCoordinate = useSelector((state) => state.musicData.xCoordinate);
  // const yCoordinate = useSelector((state) => state.musicData.yCoordinate);
  // const rangeList = useSelector((state) => state.musicData.rangeList);
  const dispatch = useDispatch();
  dispatch(setProjectId(projectId));
  const [_context1, _setContext1] = useState(null);
  const [_audio, setAudio] = useState(null);
  const [_context2, _setContext2] = useState(null);
  const [_count, setCount] = useState(0);
  const [_done1, setDone] = useState(false);

  const [_asdf, setasdf] = useState([0]);
  const [_ctx2Width, _setCtx2Width] = useState(0);
  const [_ctx2Height, _setCtx2Height] = useState(0);
  const [_play, { _stop, _pause }] = useSound(Sound);

  const [songHistory, setSongHistory] = useState([]);
  const baseUrl = import.meta.env.VITE_SERVER_URL;

  const musicEditAreaWidth = 300;

  useEffect(() => {
    const url = `${baseUrl}/projects/${projectId}/songs`;
    axios
      .get(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        setasdf(1234);
        const savedSongIds = response.data.songids;
        setSongHistory(savedSongIds.map((id) => ({ name: id, id })));
        setDone(true);
      });
  }, []);

  useEffect(() => {
    if (songId === 0) {
      return;
    }
    const url = `${baseUrl}/projects/${projectId}/songs/${songId}/wav`;

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
    setSongHistory([...songHistory, { name: songId, id: songId }]);
  }, [songId]);

  const handleChange = (e) => {
    setasdf(e.target.value);
    const selectSongId = e.target.value;
    const url = `${baseUrl}/projects/${projectId}/songs/${selectSongId}`;
    axios
      .get(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const { data } = response;
        // console.log(data);
        dispatch(setParts(data.parts));
      });
  };

  return (
    <>
      <Header projectName={projectId} />
      <Controls projectId={projectId} />
      <FormControl>
        <Select
          id="number"
          onChange={handleChange}
          aria-label="select another"
          w="25%"
        >
          {songHistory.map(({ name, id }) => (
            <option key={`${name}${id}`}>{name}</option>
          ))}
        </Select>
      </FormControl>

      <Box className="excitement-curve-container" paddingY={4} height="40vh">
        <ExcitementCurve measure={32} />
      </Box>

      <Box>
        <Flex width="100%" height="100%">
          <Box marginRight={4}>
            <Card>
              <CardHeader>Topics</CardHeader>
              <Divider />
              <CardBody>
                <Flex flexDirection="column" width={musicEditAreaWidth}>
                  <Box className="music-loops-container">
                    <LoopMaterialView />
                  </Box>
                  <TopicView />
                </Flex>
              </CardBody>
            </Card>
          </Box>
          <Spacer />
          <Box overflowX="auto">
            <Card>
              <CardHeader>music</CardHeader>
              <Divider />
              <CardBody>
                <Grid
                  templateRows="repeat(2, 1fr)"
                  templateColumns="repeat(10, 1fr)"
                >
                  <GridItem />
                  <GridItem colSpan={9}>
                    <ZoomedExcitementCurve />
                  </GridItem>
                  <GridItem>
                    <MusicInstrumentTable />
                  </GridItem>
                  <GridItem colSpan={9}>
                    <LoopTable measure={32} />
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default App;

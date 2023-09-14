import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
// import useSound from "use-sound";
import { useSearchParams } from "react-router-dom";
import {
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

import ExcitementCurve from "./app/excitementCurve/ExcitementCurve";
import LoopTable from "./app/musicEdit/LoopTable";
import LoopMaterialView from "./app/musicEdit/loopMaterisl/LoopMaterialView";
import TopicView from "./app/musicEdit/topic/TopicView";
import Controls from "./app/controls/Controls";
import Header from "./app/Header";
import ZoomedExcitementCurve from "./app/musicEdit/ZoomedExcitementCurve";
import MusicInstrumentTable from "./app/musicEdit/MusicInstrumentTable";
import { setSongId } from "./redux/songIdSlice";

function App() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectid");

  const dispatch = useDispatch();
  const songId = useSelector((state) => state.songId.songId);
  const baseUrl = `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}`;
  const musicEditAreaWidth = 300;

  // TODO
  const [_audio, setAudio] = useState(null);
  const [_count, setCount] = useState(0);
  // const [done1, setDone] = useState(false);
  // const [_play, { _stop, _pause }] = useSound(Sound);

  // 読み込まれて最初にやりたいこと
  useEffect(() => {
    // 現在のプロジェクトで作られた曲の履歴を取得
    const songHistoryURL = `${baseUrl}/songs`;
    axios
      .get(songHistoryURL) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        // setDone(true);
        const savedSongIds = response.data.songids;
        const lastSongId = savedSongIds[savedSongIds.length - 1];
        dispatch(setSongId(lastSongId));
      });
  }, []);

  useEffect(() => {
    if (songId === 0) {
      return;
    }
    const url = `${baseUrl}/songs/${songId}/wav`;

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
  }, [songId]);

  return (
    <>
      <Header projectName={projectId} />
      <Controls projectId={projectId} />

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
                    <LoopTable projectId={projectId} measure={32} />
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

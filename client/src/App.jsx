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
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import useSound from "use-sound";
import { useSearchParams } from "react-router-dom";

import Header from "./app/Header";
import Controls from "./app/controls/Controls";
import ExcitementCurve from "./app/excitementCurve/ExcitementCurve";
import LoopTable from "./app/musicEdit/LoopTable";
import MusicInstrumentTable from "./app/musicEdit/MusicInstrumentTable";
import ZoomedExcitementCurve from "./app/musicEdit/ZoomedExcitementCurve";
import LoopMaterialView from "./app/musicEdit/loopMaterisl/LoopMaterialView";
import TopicView from "./app/musicEdit/topic/TopicView";
import { setSongId } from "./redux/songIdSlice";

function App() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectid");

  const dispatch = useDispatch();
  // TODO: projectIdの対応関係
  const baseUrl = `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}`;
  const musicEditAreaWidth = 300;

  const songId = useSelector((state) => state.songId.songId);

  // TODO
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
        const { data } = response;
        const lastSongId = data[data.length - 1]?.id;
        dispatch(setSongId(lastSongId));
      });
  }, []);

  return (
    <>
      <Header projectName={projectId} projectId={projectId} songId={songId} />
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
                    <LoopMaterialView projectId={projectId} songId={songId} />
                  </Box>
                  <TopicView projectId={projectId} />
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

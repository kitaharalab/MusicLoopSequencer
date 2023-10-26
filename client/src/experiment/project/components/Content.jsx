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
import Controls from "@src/app/controls/Controls";
import ExcitementCurve from "@src/app/excitementCurve/ExcitementCurve";
import LoopTable from "@src/app/musicEdit/LoopTable";
import MusicInstrumentTable from "@src/app/musicEdit/MusicInstrumentTable";
import ZoomedExcitementCurve from "@src/app/musicEdit/ZoomedExcitementCurve";
import LoopMaterialView from "@src/app/musicEdit/loopMaterisl/LoopMaterialView";
import TopicView from "@src/app/musicEdit/topic/TopicView";
import { setLine, setMax } from "@src/redux/linesSlice";
import { setSongId } from "@src/redux/songIdSlice";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Content({ projectId }) {
  const dispatch = useDispatch();
  const baseUrl = `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}`;
  const musicEditAreaWidth = 300;

  const songId = useSelector((state) => state.songId.songId);

  useEffect(() => {
    // 現在のプロジェクトで作られた曲の履歴を取得
    const songHistoryURL = `${baseUrl}/songs`;
    axios.get(songHistoryURL).then((response) => {
      const { data } = response;
      const lastSongId = data[data.length - 1]?.id;
      dispatch(setSongId(lastSongId));
    });
  }, []);

  useEffect(() => {
    if (songId === null || songId === undefined) return;
    const songURL = `${baseUrl}/songs/${songId}`;
    axios.get(songURL).then((response) => {
      const { data } = response;
      const { excitement_curve: excitementCurve } = data;
      if (excitementCurve === null) {
        dispatch(setLine({ lines: [] }));
        dispatch(setMax(0));
      } else {
        const { curve, max_value: max } = excitementCurve;
        dispatch(setLine({ lines: curve }));
        dispatch(setMax(max));
      }
    });
  }, [songId]);

  return (
    <>
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

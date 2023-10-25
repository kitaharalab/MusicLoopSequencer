import {
  Box,
  ButtonGroup,
  IconButton,
  Icon,
  Flex,
  Text,
  Center,
  Spacer,
  Card,
  CardBody,
  Divider,
} from "@chakra-ui/react";
import axios from "axios";
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
// import onMusicLoop from "./onMusicLoop";
import { flushSync } from "react-dom";
import { BiVolumeFull, BiSolidVolumeMute, BiRefresh } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";

import { setSongId } from "../../../redux/songIdSlice";

import ScatterPlot from "./ScatterPlot";
import insertSound from "./insertSound";
import onMusicLoop from "./onMusicLoop";

function ZoomableChart({ children, width, height, zoomState }) {
  const { zoomTransform, setZoomTransform } = zoomState;
  const svgRef = useRef();
  const reset =
    JSON.stringify(d3.zoomIdentity) === JSON.stringify(zoomTransform);
  if (reset) {
    d3.select(svgRef.current).call(d3.zoom().transform, d3.zoomIdentity);
  }

  useEffect(() => {
    const zoom = d3
      .zoom()
      .scaleExtent([1, 20])
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
      });

    d3.select(svgRef.current).call(zoom).on("dblclick.zoom", null);
  }, []);

  return (
    <svg width={width} height={height} ref={svgRef}>
      <g
        transform={`translate(${zoomTransform?.x},${zoomTransform?.y}) scale(${zoomTransform?.k})`}
      >
        {children}
      </g>
    </svg>
  );
}

function Chart({
  width,
  height,
  zoomState,
  handleInsertLoopMaterial,
  handleOnClick,
}) {
  return (
    <ZoomableChart width={width} height={height} zoomState={zoomState}>
      <ScatterPlot
        width={width}
        height={width}
        handleInsertLoopMaterial={handleInsertLoopMaterial}
        handleOnClick={handleOnClick}
      />
    </ZoomableChart>
  );
}

function Content({ width, height, handleInsertLoopMaterial, handlePlayAudio }) {
  const [isMute, setIsMute] = useState(false);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);
  const zoomState = { zoomTransform, setZoomTransform };

  function handleOnClick(id) {
    if (!isMute) {
      handlePlayAudio(id);
    }
  }

  return (
    <>
      <Flex alignContent="center" marginBottom={4}>
        <Center>
          <Text>Preview</Text>
        </Center>
        <Spacer />
        <ButtonGroup>
          <IconButton
            icon={<Icon as={isMute ? BiSolidVolumeMute : BiVolumeFull} />}
            onClick={() => {
              setIsMute(!isMute);
            }}
          />
          <IconButton
            icon={<Icon as={BiRefresh} />}
            onClick={() => {
              setZoomTransform(d3.zoomIdentity);
            }}
          />
        </ButtonGroup>
      </Flex>
      <Divider />
      <Box>
        <Chart
          width={width}
          height={height}
          zoomState={zoomState}
          handleInsertLoopMaterial={handleInsertLoopMaterial}
          handleOnClick={handleOnClick}
        />
      </Box>
    </>
  );
}

export default function LoopMaterialView({ projectId, songId }) {
  // const [audio, setAudio] = useState(null);
  const wrapperRef = useRef();
  const [width, setWidth] = useState(400);
  const { part, measure } = useSelector((store) => store.sounds);
  const [audio, setAudio] = useState();
  const partsRef = useRef();
  const dispatch = useDispatch();

  const getMusicParts = () => {
    if (songId === null || songId === undefined) {
      return;
    }

    const url = `${
      import.meta.env.VITE_SERVER_URL
    }/projects/${projectId}/songs/${songId}`;
    axios.get(url).then((response) => {
      const { data } = response;
      partsRef.current = data.parts;
    });
  };

  useEffect(() => {
    setWidth(wrapperRef?.current?.clientWidth);
    getMusicParts();
  }, [songId]);

  function handleInsertLoopMaterial(loopId, songId) {
    if (part === null || measure === null || partsRef === null) {
      return;
    }

    const insertLoop = async () => {
      const music = await insertSound(
        projectId,
        songId,
        part,
        measure,
        loopId,
        partsRef.current,
      );

      flushSync(() => {
        dispatch(setSongId(undefined));
      });
      dispatch(setSongId(music.songId));
      getMusicParts();
    };

    insertLoop();
  }

  function handlePlayAudio(id) {
    async function getAndPlayMusicLoop() {
      audio?.pause();
      const loop = await onMusicLoop(projectId, songId, part, measure + 1, id);
      setAudio(loop);
      loop.play();
    }
    getAndPlayMusicLoop();
  }

  return (
    <Card>
      <CardBody>
        <Box ref={wrapperRef}>
          <Content
            width={width}
            height={width}
            handleInsertLoopMaterial={(id) => {
              handleInsertLoopMaterial(id, songId);
            }}
            handlePlayAudio={handlePlayAudio}
          />
        </Box>
      </CardBody>
    </Card>
  );
}

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
  useToast,
  useTheme,
} from "@chakra-ui/react";
import axios from "axios";
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
// import onMusicLoop from "./onMusicLoop";
import { flushSync } from "react-dom";
import {
  BiVolumeFull,
  BiSolidVolumeMute,
  BiRefresh,
  BiSolidTrashAlt,
  BiPlus,
} from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";

import ScatterPlot from "./ScatterPlot";

import { sendLoopMuteLog } from "@/api/log";
import { onMusicLoop, insertSound, deleteLoop } from "@/api/loop";
import { getApiParams, setSongId } from "@/redux/apiParamSlice";

function ZoomableChart({ width, height, children, zoomState }) {
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
      .scaleExtent([0.5, 20])
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
      });

    d3.select(svgRef.current).call(zoom).on("dblclick.zoom", null);
  }, []);

  return (
    <Box backgroundColor="gray.50">
      <svg viewBox={`0 0 ${width} ${height}`} ref={svgRef}>
        <g
          transform={`translate(${zoomTransform?.x},${zoomTransform?.y}) scale(${zoomTransform?.k})`}
        >
          {children}
        </g>
      </svg>
    </Box>
  );
}

function Chart({ zoomState, handleOnClick, setInsertLoopId, part }) {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    const url = `${import.meta.env.VITE_SERVER_URL}/parts`;
    axios.get(url).then((response) => {
      const { data } = response;
      setParts(data.map(({ id, name }) => ({ id, name })));
    });
  }, []);

  const theme = useTheme();

  const partName = parts.find(({ id }) => id === part)?.name?.toLowerCase();
  const partColor = partName ? theme.colors.part.light[partName] : "red";

  const svgWidth = 500;
  const svgHeight = 500;

  return (
    <ZoomableChart width={svgWidth} height={svgHeight} zoomState={zoomState}>
      <ScatterPlot
        width={svgWidth}
        height={svgHeight}
        handleOnClick={handleOnClick}
        setInsertLoopId={setInsertLoopId}
        partColor={partColor}
      />
    </ZoomableChart>
  );
}

function Content({ handlePlayAudio }) {
  const [isMute, setIsMute] = useState(false);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);
  const { projectId, songId, measure, partId } = useSelector(getApiParams);
  const zoomState = { zoomTransform, setZoomTransform };

  const [insertLoopId, setInsertLoopId] = useState();
  const insertToast = useToast();
  const deleteToast = useToast();
  const dispatch = useDispatch();

  function handleOnClick(id) {
    if (!isMute) {
      handlePlayAudio(id);
    }
  }

  const insertLoop = async (loopId) => {
    const inserting = insertSound(projectId, songId, partId, measure, loopId);
    insertToast.promise(inserting, {
      success: {
        title: "Inserted",
        description: "Loop material inserted successfully",
        position: "bottom-left",
        isClosable: true,
      },
      error: {
        title: "Error",
        description: "Loop material insertion failed",
        position: "bottom-left",
        isClosable: true,
      },
      loading: {
        title: "Inserting",
        description: "Loop material is being inserted",
        position: "bottom-left",
        isClosable: false,
      },
    });
    const music = await inserting;

    flushSync(() => {
      dispatch(setSongId(undefined));
    });
    dispatch(setSongId(music.songId));
  };

  async function onDeleteLoop() {
    if (partId == null || measure == null) {
      return;
    }
    const deleting = deleteLoop(projectId, songId, measure, partId);
    deleteToast.promise(deleting, {
      success: {
        title: "Deleted",
        description: "Loop material deleted successfully",
        position: "bottom-left",
        isClosable: true,
      },
      error: {
        title: "Error",
        description: "Loop material deletion failed",
        position: "bottom-left",
        isClosable: true,
      },
      loading: {
        title: "Deleting",
        description: "Loop material is being deleted",
        position: "bottom-left",
        isClosable: false,
      },
    });

    await deleting;
  }

  return (
    <>
      <Flex alignContent="center" marginBottom={4} flexWrap="wrap">
        <Center>
          <Text>Preview</Text>
        </Center>
        <Spacer />
        <ButtonGroup>
          <IconButton
            icon={<Icon as={BiPlus} />}
            onClick={() => {
              insertLoop(insertLoopId);
            }}
          />
          <IconButton
            icon={<Icon as={BiSolidTrashAlt} />}
            onClick={async () => {
              await onDeleteLoop();

              flushSync(() => {
                dispatch(setSongId(undefined));
              });
              dispatch(setSongId(songId));
            }}
          />
          <IconButton
            icon={<Icon as={isMute ? BiSolidVolumeMute : BiVolumeFull} />}
            onClick={async () => {
              const mute = !isMute;

              setIsMute(mute);
              sendLoopMuteLog(projectId, songId, mute);
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
          zoomState={zoomState}
          handleOnClick={handleOnClick}
          setInsertLoopId={setInsertLoopId}
          part={partId}
        />
      </Box>
    </>
  );
}

export default function LoopMaterialView() {
  const { projectId, songId, partId } = useSelector(getApiParams);
  const [audio, setAudio] = useState();

  function handlePlayAudio(id, part) {
    async function getAndPlayMusicLoop() {
      audio?.pause();
      const loop = await onMusicLoop(projectId, songId, part, id);
      setAudio(loop);
      loop.volume = 0.5;
      loop.play();
    }
    getAndPlayMusicLoop();
  }

  return (
    <Card minWidth="100%" height="100%">
      <CardBody height="100%">
        <Content
          projectId={projectId}
          songId={songId}
          handlePlayAudio={(id) => {
            handlePlayAudio(id, partId);
          }}
        />
      </CardBody>
    </Card>
  );
}

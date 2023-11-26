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

import { auth } from "../../../components/authentication/firebase";
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
      .scaleExtent([0.5, 20])
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
      });

    d3.select(svgRef.current).call(zoom).on("dblclick.zoom", null);
  }, []);

  return (
    <Box backgroundColor="gray.50">
      <svg width={width} height={height} viewBox="0 0 1000 1000" ref={svgRef}>
        <g
          transform={`translate(${zoomTransform?.x},${zoomTransform?.y}) scale(${zoomTransform?.k})`}
        >
          {children}
        </g>
      </svg>
    </Box>
  );
}

function Chart({
  width,
  height,
  zoomState,
  handleOnClick,
  setInsertLoopId,
  part,
}) {
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

  return (
    <ZoomableChart width={width} height={height} zoomState={zoomState}>
      <ScatterPlot
        width={1000}
        height={1000}
        handleOnClick={handleOnClick}
        setInsertLoopId={setInsertLoopId}
        partColor={partColor}
      />
    </ZoomableChart>
  );
}

function Content({ projectId, songId, width, height, handlePlayAudio }) {
  const [isMute, setIsMute] = useState(false);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);
  const { measure, part } = useSelector((store) => store.sounds);
  const zoomState = { zoomTransform, setZoomTransform };

  const [insertLoopId, setInsertLoopId] = useState();
  const insertToast = useToast();
  const dispatch = useDispatch();

  function handleOnClick(id) {
    if (!isMute) {
      handlePlayAudio(id);
    }
  }

  const insertLoop = async (loopId) => {
    const inserting = insertSound(projectId, songId, part, measure, loopId);
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

  return (
    <>
      <Flex alignContent="center" marginBottom={4}>
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
              if (part == null || measure == null) {
                return;
              }
              const deleteUrl = `${
                import.meta.env.VITE_SERVER_URL
              }/projects/${projectId}/songs/${songId}/parts/${part}/measures/${measure}`;
              const url = new URL(deleteUrl);
              url.searchParams.append("fix", import.meta.env.VITE_MODE_FIX);
              url.searchParams.append(
                "structure",
                import.meta.env.VITE_MODE_STRUCTURE,
              );
              url.searchParams.append("adapt", import.meta.env.VITE_MODE_ADAPT);

              const idToken = await auth.currentUser?.getIdToken();
              await axios.delete(url, {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                },
              });

              flushSync(() => {
                dispatch(setSongId(undefined));
              });
              dispatch(setSongId(songId));
            }}
          />
          <IconButton
            icon={<Icon as={isMute ? BiSolidVolumeMute : BiVolumeFull} />}
            onClick={async () => {
              const logUrl = `${
                import.meta.env.VITE_SERVER_URL
              }/projects/${projectId}/songs/${songId}`;
              const idToken = await auth.currentUser?.getIdToken();
              axios.post(
                logUrl,
                { mute: !isMute },
                {
                  headers: {
                    Authorization: `Bearer ${idToken}`,
                  },
                },
              );
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
          handleOnClick={handleOnClick}
          setInsertLoopId={setInsertLoopId}
          part={part}
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
  const dispatch = useDispatch();

  useEffect(() => {
    setWidth(wrapperRef?.current?.clientWidth);
  }, [songId]);

  function handlePlayAudio(id, part) {
    async function getAndPlayMusicLoop() {
      audio?.pause();
      const loop = await onMusicLoop(projectId, songId, part, id);
      setAudio(loop);
      loop.volume = 0.3;
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
            projectId={projectId}
            songId={songId}
            handlePlayAudio={(id) => {
              handlePlayAudio(id, part);
            }}
          />
        </Box>
      </CardBody>
    </Card>
  );
}

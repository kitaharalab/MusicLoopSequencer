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
import { BiVolumeFull, BiSolidVolumeMute, BiRefresh } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";

import { setSongId } from "../../../redux/songIdSlice";

import ScatterPlot from "./ScatterPlot";
import insertSound from "./insertSound";

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

function Content({ children, width, height }) {
  const [isMute, setIsMute] = useState(false);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);
  const zoomState = { zoomTransform, setZoomTransform };

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
            isDisabled
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
        <ZoomableChart width={width} height={height} zoomState={zoomState}>
          {children}
        </ZoomableChart>
      </Box>
    </>
  );
}

export default function LoopMaterialView({ projectId, songId }) {
  // const [audio, setAudio] = useState(null);
  const wrapperRef = useRef();
  const [width, setWidth] = useState(400);
  const { part, measure } = useSelector((store) => store.sounds);
  const partsRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    setWidth(wrapperRef?.current?.clientWidth);

    const getMusicParts = () => {
      const url = `${
        import.meta.env.VITE_SERVER_URL
      }/projects/${projectId}/songs/${songId}`;
      axios.get(url).then((response) => {
        const { data } = response;
        partsRef.current = data.parts;
      });
    };
    getMusicParts();
  }, [songId]);

  function handleInsertLoopMaterial(loopId) {
    if (part === null || measure === null || partsRef === null) {
      return;
    }

    const insertLoop = async () => {
      const music = await insertSound(
        projectId,
        part,
        measure,
        loopId,
        partsRef.current,
      );
      dispatch(setSongId(music.songid));
    };

    insertLoop();
  }

  return (
    <>
      {/* <canvas
        ref={canvasRef}
        width="400"
        height="400"
        id="canvas3"
        onMouseMove={async ({ nativeEvent }) => {
          dispatch(setMusicLoopId(null));
          for (let i = 0; i < xCoordinate.length; i++) {
              dispatch(setMusicLoopId(i));
              if (currentMusicLoop !== i) {
                dispatch(setMusicLoopId(i));
                const test = await onMusicLoop(partId, i);
                setAudio(test);
                // test.play();
                setCurrentMusicLoop(i);
              }
            }
          }
        }}
      /> */}

      <Card>
        <CardBody>
          <Box ref={wrapperRef}>
            <Content width={width} height={width}>
              <ScatterPlot
                width={width}
                height={width}
                handleInsertLoopMaterial={handleInsertLoopMaterial}
              />
            </Content>
          </Box>
        </CardBody>
      </Card>
    </>
  );
}

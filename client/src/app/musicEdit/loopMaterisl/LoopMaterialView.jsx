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
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import insertSound from "./insertSound";
// import onMusicLoop from "./onMusicLoop";
import { BiVolumeFull, BiSolidVolumeMute, BiRefresh } from "react-icons/bi";

import ScatterPlot from "./ScatterPlot";

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

    d3.select(svgRef.current).call(zoom);
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

export default function LoopMaterialView() {
  // const selectedMeasureId = useSelector((state) => state.block.posRectX);
  // const selectedPartId = useSelector((state) => state.block.posRectY)
  // const musicLoopId = useSelector((state) => state.musicLoop.musicLoopId);
  // const [audio, setAudio] = useState(null);
  // const [currentMusicLoop, setCurrentMusicLoop] = useState(null);
  // const parts = useSelector((state) => state.sounds.parts);
  // const measureId = useSelector((state) => state.canvas.measureId);
  // const partId = useSelector((state) => state.canvas.partId);
  // const projectId = useSelector((state) => state.projectId.projectId);
  // const dispatch = useDispatch();
  const wrapperRef = useRef();
  const width = wrapperRef?.current?.clientWidth;

  // const clickRect = ({ nativeEvent }) => {
  //    const { offsetX, offsetY } = nativeEvent;
  //    dispatch(setPos({ offsetX, offsetY }))
  // };

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
        onMouseDown={async ({ nativeEvent }) => {
          for (let i = 0; i < xCoordinate.length; i++) {
              const music = await insertSound(
                projectId,
                partId,
                measureId,
                musicLoopId,
                parts,
              );
              dispatch(setParts(music.parts));
              dispatch(setId(music.songid));
            }
          }
        }}
      /> */}

      <Card>
        <CardBody>
          <Box ref={wrapperRef}>
            <Content width={width} height={width}>
              <ScatterPlot width={width} height={width} />
            </Content>
          </Box>
        </CardBody>
      </Card>
    </>
  );
}

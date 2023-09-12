import React, { useEffect, useRef, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
import * as d3 from "d3";
// import insertSound from "./insertSound";
// import onMusicLoop from "./onMusicLoop";
// import { setPos } from "./redux/blockCanvasSlice";
// import { setMusicLoopId } from "../../redux/musicLoopSlice";
// import { setJson } from "./redux/soundDataSlice";
// import { setParts } from "../../redux/soundsSlice";
// import { setId } from "../../redux/songIdSlice";
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
import { BiVolumeFull, BiSolidVolumeMute, BiRefresh } from "react-icons/bi";
import ScatterPlot from "./ScatterPlot";

function ZoomableChart({ children, width, height, zoomState }) {
  const { zoomTransform, setZoomTransform } = zoomState;

  const svgRef = useRef();

  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
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
  const initZoomTransform = { x: 0, y: 0, k: 1 };
  const [zoomTransform, setZoomTransform] = useState(initZoomTransform);
  const zoomState = { zoomTransform, setZoomTransform };

  return (
    <Card>
      <CardBody>
        <Flex alignContent="center">
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
                setZoomTransform(initZoomTransform);
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
      </CardBody>
    </Card>
  );
}

export default function LoopMaterialView({ width }) {
  // const selectedMeasureId = useSelector((state) => state.block.posRectX);
  // const selectedPartId = useSelector((state) => state.block.posRectY)
  // const musicLoopId = useSelector((state) => state.musicLoop.musicLoopId);
  const [_audio, _setAudio] = useState(null);
  // const [currentMusicLoop, setCurrentMusicLoop] = useState(null);
  // const parts = useSelector((state) => state.sounds.parts);
  // const measureId = useSelector((state) => state.canvas.measureId);
  // const partId = useSelector((state) => state.canvas.partId);
  // const projectId = useSelector((state) => state.projectId.projectId);
  // const dispatch = useDispatch();

  // const clickRect = ({ nativeEvent }) => {
  //    const { offsetX, offsetY } = nativeEvent;
  //    dispatch(setPos({ offsetX, offsetY }))

  // };

  // const sleep = (waitMsec) => {
  //   const startMsec = new Date();

  //   // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
  //   while (new Date() - startMsec < waitMsec);
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
      <Content width={width} height={width}>
        <ScatterPlot width={width} height={width} />
      </Content>
    </>
  );
}

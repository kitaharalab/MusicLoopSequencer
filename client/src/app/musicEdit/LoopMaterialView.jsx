import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as d3 from "d3";
// import insertSound from "./insertSound";
// import onMusicLoop from "./onMusicLoop";
// import { setPos } from "./redux/blockCanvasSlice";
// import { setMusicLoopId } from "../../redux/musicLoopSlice";
// import { setJson } from "./redux/soundDataSlice";
// import { setParts } from "../../redux/soundsSlice";
// import { setId } from "../../redux/songIdSlice";

export default function LoopMaterialView({ width }) {
  // const selectedMeasureId = useSelector((state) => state.block.posRectX);
  // const selectedPartId = useSelector((state) => state.block.posRectY)
  // const musicLoopId = useSelector((state) => state.musicLoop.musicLoopId);
  const [_audio, setAudio] = useState(null);
  // const [currentMusicLoop, setCurrentMusicLoop] = useState(null);
  // const parts = useSelector((state) => state.sounds.parts);
  // const measureId = useSelector((state) => state.canvas.measureId);
  // const partId = useSelector((state) => state.canvas.partId);
  // const projectId = useSelector((state) => state.projectId.projectId);
  const xCoordinate = useSelector((state) => state.musicData.xCoordinate);
  const yCoordinate = useSelector((state) => state.musicData.yCoordinate);
  const rangeList = useSelector((state) => state.musicData.rangeList);
  // const dispatch = useDispatch();
  // const canvasRef = useRef();

  const loopMaterials = xCoordinate.map((x, i) => ({
    x,
    y: yCoordinate[i],
    id: i,
  }));
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(xCoordinate, (x) => x))
    .range([0, width])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(yCoordinate, (y) => y))
    .range([width, 0])
    .nice();
  const colorScale = d3.scaleOrdinal(d3.schemeDark2);

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
      <svg width={width} height={width}>
        <g>
          {loopMaterials.map(({ x, y, id }, i) => (
            <circle
              key={id}
              transform={`translate(${xScale(x)} ${yScale(y)})`}
              r={4}
              fill={colorScale(rangeList.findLastIndex((range) => i > range))}
            />
          ))}
        </g>
      </svg>
    </>
  );
}

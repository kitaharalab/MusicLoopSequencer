/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// import * as d3 from "d3";
import { Box } from "@chakra-ui/react";
import { setStart, setDraw } from "./redux/linesSlice";
import { setPos } from "./redux/blockCanvasSlice";

function drawBackgroundGrid(
  canvas,
  width,
  height,
  gridWidthCount,
  gridHeightCount,
) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  // outline
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.lineWidth = "3";
  ctx.strokeRect(0, 0, width, height);
  // grid
  ctx.lineWidth = "1";
  ctx.strokeStyle = "gray";
  const gridWidth = width / gridWidthCount;
  const gridHeight = height / gridHeightCount;
  for (let i = 0; i < gridWidthCount; i++) {
    for (let j = 0; j < gridHeightCount; j++) {
      ctx.strokeRect(gridWidth * i, gridHeight * j, gridWidth, gridHeight);
    }
  }
}

function drawLine(canvas, line) {
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = "3";
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  const step = 1;
  for (let i = 0; i < line.length - 1; i += step) {
    ctx.moveTo(i, canvas.clientHeight - line[i]); // 盛り上がり度曲線を描く．
    ctx.lineTo(i + step, canvas.clientHeight - line[i + step]);
  }
  ctx.stroke();
}

export default function ExcitementCurve() {
  const linesY = useSelector((state) => state.lines1.lines);
  const dispatch = useDispatch();
  const canvasRef = useRef();
  const wrapperRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [line, setLine] = useState([]);

  function handleResize() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    ctx.canvas.height = wrapperRef.current?.clientHeight;
    ctx.canvas.width = wrapperRef.current?.clientWidth;
  }

  useEffect(() => {
    // resize
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    ctx.canvas.height = wrapperRef.current?.clientHeight;
    ctx.canvas.width = wrapperRef.current?.clientWidth;

    // canvas init
    drawBackgroundGrid(canvas, canvas.clientWidth, canvas.clientHeight, 32, 5);
    const initLine = new Array(wrapperRef.current?.clientWidth);
    setLine(initLine.fill(0));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    drawBackgroundGrid(canvas, canvas.clientWidth, canvas.clientHeight, 32, 5);
    drawLine(canvas, line);
  }, [line]);

  const startDraw = ({ nativeEvent }) => {
    setDrawing(true);
    const { offsetX, offsetY } = nativeEvent;
    // const { screenX, screenY } = nativeEvent;
    // setPosX(Math.floor(offsetX));
    // setPosY(Math.floor(offsetY));
    // dispatch(setStart({ posX, posY }));

    // dispatch(
    //   setStart({ posX: Math.floor(offsetX), posY: Math.floor(offsetY) }),
    // );

    line[offsetX] = offsetY;
    setLine([...line]);
    setPosition({ x: offsetX, y: offsetY });
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing) {
      return;
    }

    const { offsetX, offsetY } = nativeEvent;

    line[offsetX] = canvasRef.current.clientHeight - Math.floor(offsetY);

    const pos = { x: offsetX, y: offsetY };

    // liner scale
    const prePos = position.x < pos.x ? position : pos;
    if (Math.abs(position.x - pos.x) !== 0) {
      const tan = parseFloat(position.y - pos.y) / (position.x - pos.x);
      const dis = Math.abs(position.x - pos.x);
      for (let i = 0; i < dis; i++) {
        line[prePos.x + i] =
          canvasRef.current.clientHeight - Math.floor(prePos.y + tan * i);
      }
    }

    setPosition(pos);
    setLine([...line]);
  };

  const stopDraw = () => {
    setDrawing(false);
  };

  return (
    <Box ref={wrapperRef} height="100%" onMouseLeave={stopDraw}>
      <canvas
        ref={canvasRef}
        width="100px"
        height="100px"
        id="canvas1"
        onMouseDown={startDraw}
        onMouseUp={stopDraw}
        onMouseMove={draw}
      />
    </Box>
  );
}

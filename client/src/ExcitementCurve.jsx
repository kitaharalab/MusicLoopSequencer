/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Box } from "@chakra-ui/react";
import { setLine } from "./redux/linesSlice";
// import { setPos } from "./redux/blockCanvasSlice";
function drawBackgroundOutline(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.lineWidth = "3";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

function drawBackgroundGrid(
  canvas,
  width,
  height,
  gridWidthCount,
  gridHeightCount,
) {
  const ctx = canvas.getContext("2d");
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

function drawBackground(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.fill();
  const gridWidthCount = 32;
  const gridHeightCount = 5;
  drawBackgroundGrid(
    canvas,
    canvas.clientWidth,
    canvas.clientHeight,
    gridWidthCount,
    gridHeightCount,
  );
  drawBackgroundOutline(canvas);
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
  const dispatch = useDispatch();
  const canvasRef = useRef();
  const wrapperRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lines, setLines] = useState([]);

  useEffect(() => {
    // resize
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    ctx.canvas.height = wrapperRef.current?.clientHeight;
    ctx.canvas.width = wrapperRef.current?.clientWidth;

    // canvas init
    drawBackground(canvas);
    const initLine = new Array(wrapperRef.current?.clientWidth);
    setLines(initLine.fill(0));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    drawBackground(canvas);
    drawLine(canvas, lines);
  }, [lines]);

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

    const newline = lines.map((y, i) =>
      i === offsetX ? canvasRef.current.clientHeight - Math.floor(offsetY) : y,
    );
    setLines(newline);
    setPosition({ x: offsetX, y: offsetY });
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing) {
      return;
    }

    const { offsetX, offsetY } = nativeEvent;

    const newline = lines.map((y, i) =>
      i === offsetX ? canvasRef.current.clientHeight - Math.floor(offsetY) : y,
    );

    const pos = { x: offsetX, y: offsetY };

    // liner scale
    const prePos = position.x < pos.x ? position : pos;
    if (Math.abs(position.x - pos.x) !== 0) {
      const tan = parseFloat(position.y - pos.y) / (position.x - pos.x);
      const dis = Math.abs(position.x - pos.x);
      for (let i = 0; i < dis && prePos.x + i < newline.length; i++) {
        newline[prePos.x + i] =
          canvasRef.current.clientHeight - Math.floor(prePos.y + tan * i);
      }
    }

    setPosition(pos);
    setLines(newline);
  };

  const stopDraw = () => {
    if (!drawing) {
      return;
    }

    setDrawing(false);
    dispatch(setLine({ lines }));
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

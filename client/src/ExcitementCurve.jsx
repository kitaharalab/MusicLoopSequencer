/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Box } from "@chakra-ui/react";
import { setLine } from "./redux/linesSlice";

function drawBackgroundOutline(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.lineWidth = "3";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

function drawBackgroundGrid(canvas, width, measure) {
  const ctx = canvas.getContext("2d");

  const gridWidth = width / measure;

  for (let i = 0; i < measure; i++) {
    ctx.beginPath();
    ctx.lineWidth = (((i + 1) % 2) + 1) * 0.5;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.moveTo(gridWidth * i, 0);
    ctx.lineTo(gridWidth * i, canvas.height);
    ctx.stroke();
  }
}

function drawBackground(canvas, measure) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.fill();
  drawBackgroundGrid(canvas, canvas.clientWidth, measure);
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

export default function ExcitementCurve({ measure }) {
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
    ctx.canvas.height = wrapperRef.current.offsetHeight;
    const width = wrapperRef.current.clientWidth ?? measure * 36;
    const canvasWidth = (width / measure) * measure;
    ctx.canvas.width = canvasWidth;

    // canvas init
    drawBackground(canvas, measure);
    const initLine = new Array(canvasWidth);
    setLines(initLine.fill(0));
  }, [wrapperRef.current?.clientWidth, wrapperRef.current?.clientHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    drawBackground(canvas, measure);
    drawLine(canvas, lines);
  }, [lines]);

  const startDraw = ({ nativeEvent }) => {
    setDrawing(true);
    const { offsetX, offsetY } = nativeEvent;
    const height = canvasRef.current.clientHeight;
    const curve = {
      x: Math.floor(offsetX),
      y: Math.floor(offsetY),
    };

    const newline = lines.map((y, i) => (i === offsetX ? height - curve.y : y));
    setLines(newline);

    setPosition({ x: offsetX, y: offsetY });
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing) {
      return;
    }

    const { offsetX, offsetY } = nativeEvent;
    const pos = { x: offsetX, y: offsetY };

    const newline = lines.map((y, i) =>
      i === offsetX ? canvasRef.current.clientHeight - Math.floor(offsetY) : y,
    );

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

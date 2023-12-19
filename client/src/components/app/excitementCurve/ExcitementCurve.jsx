/* eslint-disable react/jsx-props-no-spreading */
import { Box } from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import getExcitementCurve from "@/api/song/getExcitementCurve";
import { getApiParams } from "@/redux/apiParamSlice";
import { setLine, setMax } from "@/redux/linesSlice";

function drawBackgroundOutline(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.lineWidth = "3";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

function drawBackgroundGrid(canvas, measure, division = 5) {
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;

  const gridWidth = width / measure;
  const gridHeight = canvas.clientHeight / division;

  for (let i = 0; i < measure; i++) {
    ctx.beginPath();
    ctx.lineWidth = (((i + 1) % 2) + 1) * 0.5;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.moveTo(gridWidth * i, 0);
    ctx.lineTo(gridWidth * i, canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i < division; i++) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.moveTo(0, gridHeight * i);
    ctx.lineTo(canvas.width, gridHeight * i);
    ctx.stroke();
  }
}

function drawLineGrid(canvas, line, measure, division = 5) {
  if (!line || line.length === 0) {
    return;
  }
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const gridWidth = width / measure;
  const gridHeight = height / division;
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  for (let i = 0; i < measure; i++) {
    const gridLine = line.slice(i * gridWidth, (i + 1) * gridWidth);
    const gridLineAvg = gridLine.reduce((a, b) => a + b, 0) / gridLine.length;
    const gridRatio = Math.ceil((gridLineAvg / height) * division);
    ctx.fillRect(
      i * gridWidth,
      (5 - gridRatio) * gridHeight,
      gridWidth,
      gridHeight,
    );
  }
}

function drawBackground(canvas, measure) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.fill();
  drawBackgroundGrid(canvas, measure);
  drawBackgroundOutline(canvas);
}

function drawLine(canvas, line) {
  const isExperimental = Boolean(import.meta.env.VITE_MODE_EXPERIMENTAL);
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = "3";
  ctx.strokeStyle = isExperimental ? "gray" : "blue";
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
  const { projectId, songId } = useSelector(getApiParams);

  function drawItems() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas?.getContext("2d");
    ctx.canvas.height = wrapperRef.current.offsetHeight;
    const width = wrapperRef.current.clientWidth ?? measure * 36;
    const canvasWidth = (width / measure) * measure;
    ctx.canvas.width = canvasWidth;
    drawBackground(canvas, measure);
    drawLine(canvas, lines);
    drawLineGrid(canvas, lines, measure);
    const isExperimental = Boolean(import.meta.env.VITE_MODE_EXPERIMENTAL);
    if (isExperimental) {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
  }

  function resize() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas?.getContext("2d");
    ctx.canvas.height = wrapperRef.current.offsetHeight;
    const width = wrapperRef.current.clientWidth ?? measure * 36;
    const canvasWidth = (width / measure) * measure;
    ctx.canvas.width = canvasWidth;
    drawItems();
  }

  async function setExcitementCurve() {
    const width = wrapperRef.current?.clientWidth ?? measure * 36;
    const height = wrapperRef.current?.offsetHeight ?? 300;
    const canvasWidth = (width / measure) * measure;

    const { curve, max } = await getExcitementCurve(projectId, songId).catch(
      () => {
        const initLine = new Array(canvasWidth).fill(0);
        return { curve: initLine, max: 300 };
      },
    );

    const xScale = d3
      .scaleLinear()
      .domain([0, canvasWidth])
      .range([0, curve.length])
      .nice();
    const yScale = d3.scaleLinear().domain([0, max]).range([0, height]).nice();
    const scaledLines = Array(canvasWidth)
      .fill(0)
      .map((_, i) => yScale(curve[Math.floor(xScale(i))]));

    setLines(scaledLines);
    dispatch(setMax({ max: height }));
    dispatch(setLine({ lines: scaledLines }));
  }

  useEffect(() => {
    window.addEventListener("resize", () => {
      resize();
    });

    setExcitementCurve();

    resize();

    return window.removeEventListener("resize", () => {
      resize();
    });
  }, []);

  useEffect(() => {
    setExcitementCurve();
  }, [songId]);

  useEffect(() => {
    drawItems();
  }, [lines]);

  function updatePosition(x, y) {
    const height = canvasRef.current.clientHeight;
    const curve = {
      x: Math.floor(x),
      y: Math.floor(y),
    };

    const newline = lines.map((lineY, i) =>
      i === x ? height - curve.y : lineY,
    );
    setLines(newline);

    setPosition({ x, y });
  }

  const startDraw = (event) => {
    setDrawing(true);

    if (!event.clientX) {
      if (event.targetTouches.length > 1) {
        return;
      }
      const rect = event.target.getBoundingClientRect();
      const x = event.targetTouches[0].clientX - rect.left;
      const y = event.targetTouches[0].clientY - rect.top;
      updatePosition(x, y);
      return;
    }

    const { offsetX, offsetY } = event.nativeEvent;
    updatePosition(offsetX, offsetY);
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

  const isExperimental = Boolean(import.meta.env.VITE_MODE_EXPERIMENTAL);
  const drawFuncs = isExperimental
    ? {}
    : {
        onMouseDown: startDraw,
        onMouseUp: stopDraw,
        onMouseMove: draw,
        onTouchStart: startDraw,
        onTouchEnd: stopDraw,
        onTouchMove: draw,
      };

  return (
    <Box ref={wrapperRef} height="100%" onMouseLeave={stopDraw}>
      <canvas
        ref={canvasRef}
        width="100px"
        height="100px"
        id="canvas1"
        {...drawFuncs}
      />
    </Box>
  );
}

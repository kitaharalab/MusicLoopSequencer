/* eslint-disable react/jsx-props-no-spreading */
import { Box } from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useDispatch } from "react-redux";

import { handleMouseDown, handleMouseMove } from "./draw/actions";
import { drawBackground, drawLineGrid } from "./draw/background";
import drawLine from "./draw/line";

import { setLine, setMax } from "@/redux/linesSlice";

export default function CurveCanvas({ measure, curve: initCurve, curveMax }) {
  const dispatch = useDispatch();
  const canvasRef = useRef();
  const wrapperRef = useRef();
  const gridWidth = 36;

  const curveRef = useRef(initCurve);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(false);

  function getLineScale(canvas) {
    if (!canvas) {
      return {};
    }
    const ctx = canvas.getContext("2d");

    const { height } = ctx.canvas;
    const { width } = ctx.canvas;

    const scaleX = d3
      .scaleLinear()
      .domain([0, curveRef.current.length])
      .range([0, width]);
    const scaleY = d3.scaleLinear().domain([0, curveMax]).range([height, 0]);
    const line = d3
      .line()
      .x((_, i) => scaleX(i))
      .y((d) => scaleY(d));

    return { line, scaleX, scaleY };
  }

  function setCanvasSize(canvas) {
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    ctx.canvas.height = wrapperRef.current.offsetHeight ?? 100;
    const currentWidth = wrapperRef.current.offsetWidth ?? measure * gridWidth;
    const canvasWidth = (currentWidth / measure) * measure;
    ctx.canvas.width = canvasWidth;
  }

  function resize() {
    setCanvasSize(canvasRef.current);
    drawBackground(canvasRef.current, measure);

    const lineScale = getLineScale(canvasRef.current);
    drawLineGrid(canvasRef.current, curveRef.current, curveMax, measure);
    drawLine(canvasRef.current, curveRef.current, lineScale);
    dispatch(setLine({ lines: curveRef.current }));
  }

  useEffect(() => {
    window.addEventListener("resize", () => {
      resize();
    });

    resize();
    dispatch(setMax({ max: curveMax }));

    return () => {
      window.removeEventListener("resize", () => {
        resize();
      });
    };
  }, []);

  useEffect(() => {
    drawBackground(canvasRef.current, measure);

    const lineScale = getLineScale(canvasRef.current);
    drawLineGrid(canvasRef.current, curveRef.current, curveMax, measure);
    drawLine(canvasRef.current, curveRef.current, lineScale);
    dispatch(setLine({ lines: curveRef.current }));
  }, [curveRef.current]);

  return (
    <Box ref={wrapperRef} height="100%">
      <canvas
        ref={canvasRef}
        onMouseDown={(event) => {
          flushSync(() => setDrawing(true));
          const { offsetX, offsetY } = event.nativeEvent;
          const currentPosition = handleMouseDown(event, {
            x: offsetX,
            y: offsetY,
          });
          setPosition(currentPosition);
        }}
        onMouseMove={(event) => {
          const { offsetX, offsetY } = event.nativeEvent;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.fillRect(offsetX, offsetY, 10, 10);
          if (!drawing) {
            return;
          }

          const { position: currentPosition, curve: newCurve } =
            handleMouseMove(
              event,
              curveRef.current,
              curveMax,
              canvasRef.current,
              position,
            );
          setPosition(currentPosition);
          curveRef.current = newCurve;
        }}
        onMouseUp={(event) => {
          setDrawing(false);
          const { offsetX, offsetY } = event.nativeEvent;
          setPosition({ x: offsetX, y: offsetY });
        }}
        onMouseLeave={() => {
          setDrawing(false);
        }}
        width="100px"
        height="100px"
      />
    </Box>
  );
}

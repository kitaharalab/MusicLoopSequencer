import { Box } from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useRef } from "react";
import { useSelector } from "react-redux";

export default function ExcitementCurve() {
  const excitementCurve = useSelector((store) => store.lines1.lines);
  const excitementCurveMax = useSelector((store) => store.lines1.max);
  const wrapperRef = useRef();
  const width = wrapperRef?.current?.clientWidth ?? 200;
  const height = wrapperRef?.current?.clientHeight ?? 200;

  const xScale = d3
    .scaleLinear()
    .domain([0, excitementCurve.length])
    .range([0, width])
    .nice(50);
  const yScale = d3
    .scaleLinear()
    .domain([0, excitementCurveMax])
    .range([height, 0])
    .nice(50);
  const line = d3
    .line()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d));

  return (
    <Box
      ref={wrapperRef}
      height="100%"
      width="100%"
      overflowX="auto"
      background="gray.100"
      borderRadius={10}
    >
      <svg width={width} height={height}>
        <path
          d={line(excitementCurve)}
          stroke="black"
          strokeWidth={3}
          fill="none"
        />
      </svg>
    </Box>
  );
}

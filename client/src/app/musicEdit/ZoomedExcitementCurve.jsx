import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";

export default function ZoomedExcitementCurve() {
  const excitementCurve = useSelector((store) => store.lines1.lines);
  const wrapperRef = useRef();
  const width = wrapperRef?.current?.clientWidth ?? 200;
  const height = wrapperRef?.current?.clientHeight ?? 200;
  const xScale = d3
    .scaleLinear()
    .domain([0, excitementCurve.length])
    .range([0, width])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(excitementCurve)])
    .range([height, 0])
    .nice();
  const line = d3
    .line()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d));

  useEffect(() => {
    function handleOnWheel(e) {
      e.preventDefault();
      if (e.ctrlKey) {
        // 拡大
        return;
      }

      const wrapperEl = wrapperRef?.current;
      wrapperEl?.scrollTo({
        left: wrapperEl.scrollLeft + e.deltaY,
        behavior: "smooth",
      });
    }

    wrapperRef?.current?.addEventListener("wheel", handleOnWheel, {
      passive: false,
    });
    return () => {
      wrapperRef?.current?.removeEventListener("wheel", handleOnWheel, {
        passive: false,
      });
    };
  }, []);

  return (
    <Box ref={wrapperRef} overflowX="auto">
      <svg width={width * 4}>
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

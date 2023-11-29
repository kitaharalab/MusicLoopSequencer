import { theme } from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useState } from "react";
import { useSelector } from "react-redux";

export default function ScatterPlot({
  width,
  height,
  handleOnClick,
  setInsertLoopId,
  partColor,
}) {
  const [selectId, setSelectId] = useState();
  const loopPositions = useSelector((state) => state.musicData.loopPositions);
  if (
    loopPositions.length === 0 ||
    loopPositions === undefined ||
    loopPositions === null ||
    !width ||
    !height
  ) {
    return <g />;
  }

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(loopPositions, ({ x }) => x))
    .range([0, width])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(loopPositions, ({ y }) => y))
    .range([height, 0])
    .nice();
  const colorScale = d3
    .scaleSequential(d3.interpolate(theme.colors.gray[500], partColor))
    .domain([0, 4]);

  return (
    <g>
      {loopPositions.map(({ x, y, id, excitement }) => {
        const fillColor = colorScale(excitement);
        return (
          <circle
            key={id}
            transform={`translate(${xScale(x)} ${yScale(y)})`}
            r={selectId === id ? "1.5%" : "1%"}
            stroke={
              selectId === undefined || selectId === id ? "black" : "none"
            }
            strokeWidth={1}
            strokeOpacity={0.5}
            fill={fillColor}
            fillOpacity={selectId === undefined || selectId === id ? 1 : 0.5}
            onClick={() => {
              const reSelect = selectId === id;
              setSelectId(reSelect ? undefined : id);
              setInsertLoopId(id);
              if (!reSelect) {
                handleOnClick(id);
              }
            }}
          />
        );
      })}
    </g>
  );
}
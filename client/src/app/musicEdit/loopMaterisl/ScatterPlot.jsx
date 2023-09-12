import React from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";

export default function ScatterPlot({ width }) {
  const xCoordinate = useSelector((state) => state.musicData.xCoordinate);
  const yCoordinate = useSelector((state) => state.musicData.yCoordinate);
  const rangeList = useSelector((state) => state.musicData.rangeList);

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

  return (
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
  );
}

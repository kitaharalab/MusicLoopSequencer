import * as d3 from "d3";
import React from "react";
import { useSelector } from "react-redux";

export default function ScatterPlot({ width, height }) {
  const xCoordinate = useSelector((state) => state.musicData.xCoordinate);
  const yCoordinate = useSelector((state) => state.musicData.yCoordinate);
  const rangeList = useSelector((state) => state.musicData.rangeList);
  if (!xCoordinate || !yCoordinate || !rangeList || !width || !height) {
    return <g />;
  }

  const loopMaterials = xCoordinate.map((x, i) => ({
    x,
    y: yCoordinate[i],
    id: i,
  }));
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(loopMaterials, ({ x }) => x))
    .range([0, width])
    .nice();
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(loopMaterials, ({ y }) => y))
    .range([height, 0])
    .nice();
  const colorScale = d3.scaleOrdinal(d3.schemeDark2);

  return (
    <g>
      {loopMaterials.map(({ x, y, id }, i) => (
        <circle
          key={id}
          transform={`translate(${xScale(x)} ${yScale(y)})`}
          r={3}
          fill={colorScale(rangeList.findLastIndex((range) => i > range))}
        />
      ))}
    </g>
  );
}

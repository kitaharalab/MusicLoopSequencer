import * as d3 from "d3";
import React from "react";

export default function BarChartContent({ data, width, height, padding }) {
  if (data === undefined) {
    return <g />;
  }
  const xScale = d3
    .scaleBand()
    .domain(data?.map(({ name }) => name))
    .padding(padding)
    .range([0, width]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data?.map(({ value }) => value))])
    .range([height, 0]);
  const colorScale = d3
    .scaleSequential(d3.interpolateRainbow)
    .domain([0, data.length]);

  return (
    <g>
      {data?.map(({ name, value }, i) => (
        <rect
          key={`${name}-${value}`}
          x={xScale(name)}
          y={yScale(value)}
          width={xScale.bandwidth()}
          height={height - yScale(value)}
          fill={colorScale(i)}
        />
      ))}
    </g>
  );
}

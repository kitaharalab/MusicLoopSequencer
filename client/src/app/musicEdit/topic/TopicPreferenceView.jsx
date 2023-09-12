import React from "react";
import * as d3 from "d3";

export default function TopicPreferenceView({ data, width, height }) {
  const musicXScale = d3
    .scaleBand()
    .domain(data.map(({ name }) => name))
    .padding(0.2)
    .range([0, width]);
  const musicYScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map(({ value }) => value))])
    .range([height, 0]);

  const colorScale = d3
    .scaleSequential(d3.interpolateRainbow)
    .domain([0, data.length]);

  return (
    <svg width={width} height={height}>
      <g>
        {data.map(({ name, value }, i) => {
          console.log(name);
          return (
            <rect
              x={musicXScale(name)}
              y={musicYScale(value)}
              width={musicXScale.bandwidth()}
              height={height - musicYScale(value)}
              fill={colorScale(i)}
            />
          );
        })}
      </g>
    </svg>
  );
}

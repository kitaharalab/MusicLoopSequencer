/* eslint-disable import/no-unresolved */
import React from "react";
import * as d3 from "d3";

export default function TopicLegend({ names, width, padding }) {
  console.log(names);
  const xScale = d3
    .scaleBand()
    .domain(names)
    .range([0, width])
    .padding(padding);

  return (
    <g>
      {names.map((name) => (
        <text
          key={name}
          x={xScale(name) + xScale.bandwidth() / 2}
          textAnchor="middle"
          style={{ userSelect: "none" }}
        >
          {name}
        </text>
      ))}
    </g>
  );
}

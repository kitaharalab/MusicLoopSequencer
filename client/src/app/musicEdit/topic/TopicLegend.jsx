import * as d3 from "d3";
import React from "react";

export default function TopicLegend({ names, width, padding }) {
  if (names === undefined) {
    return <g />;
  }

  const xScale = d3
    .scaleBand()
    .domain(names)
    .range([0, width])
    .padding(padding);

  return (
    <g>
      {names?.map((name) => (
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

import * as d3 from "d3";
import React from "react";

export default function StackedBarChartContent({
  data,
  width,
  height,
  padding,
}) {
  if (data === undefined) {
    return <g />;
  }

  const keys = Object.keys(data[0]).filter((d) => d !== "name");
  const stackedData = d3.stack().keys(keys)(data);
  const maxY = d3.max(stackedData, (group) => d3.max(group, (d) => d[1]));

  const xScale = d3
    .scaleBand()
    .domain(data?.map(({ name }) => name))
    .padding(padding)
    .range([0, width]);
  const yScale = d3.scaleLinear().domain([0, maxY]).range([height, 0]);
  const colorScale = d3
    .scaleSequential(d3.interpolateRainbow)
    .domain([0, keys.length]);

  return (
    <g>
      {stackedData?.map((group, i) =>
        group.map((d) => (
          <rect
            key={`${d[0]}-${d[1]}`}
            x={xScale(d.data.name)}
            y={yScale(d[1])}
            width={xScale.bandwidth()}
            height={yScale(d[0]) - yScale(d[1])}
            fill={colorScale(i)}
          />
        )),
      )}
    </g>
  );
}

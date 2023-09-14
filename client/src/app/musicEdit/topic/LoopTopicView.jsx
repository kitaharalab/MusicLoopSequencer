/* eslint-disable import/no-unresolved */
import React from "react";
import BarChartContent from "@components/chart/BarChartContent";

export default function LoopTopicView({ data, width, height, padding }) {
  return (
    <g>
      <BarChartContent
        data={data}
        width={width}
        height={height}
        padding={padding}
      />
      <line x1={0} y1={height} x2={width} y2={height} stroke="black" />
    </g>
  );
}

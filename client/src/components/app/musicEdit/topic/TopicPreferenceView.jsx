/* eslint-disable import/no-unresolved */
import React from "react";

import StackedBarChartContent from "@/components/chart/StackedBarChartContent";

export default function TopicPreferenceView({ data, width, height, padding }) {
  return (
    <g>
      <StackedBarChartContent
        data={data}
        width={width}
        height={height}
        padding={padding}
      />
      {/* <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="white"
        opacity={0.7}
      />
      <text x={width / 2} y={height / 2} textAnchor="middle" fontSize={50}>
        Sample
      </text> */}
      <line x1={0} y1={height} x2={width} y2={height} stroke="black" />
    </g>
  );
}

/* eslint-disable import/no-unresolved */
import React from "react";
import BarChart from "@components/chart/BarChart";

export default function LoopTopicView({ data, width, height }) {
  return <BarChart data={data} width={width} height={height} />;
}

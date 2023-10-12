import * as d3 from "d3";
import React, { useState } from "react";
import { useSelector } from "react-redux";

export default function ScatterPlot({
  width,
  height,
  handleInsertLoopMaterial,
  handleOnClick,
}) {
  const xCoordinate = useSelector((state) => state.musicData.xCoordinate);
  const yCoordinate = useSelector((state) => state.musicData.yCoordinate);
  const rangeList = useSelector((state) => state.musicData.rangeList);
  const [selectId, setSelectId] = useState();

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
      {loopMaterials.map(({ x, y, id }, i) => {
        const fillColor = colorScale(
          rangeList.findLastIndex((range) => i > range),
        );
        return (
          <circle
            key={id}
            transform={`translate(${xScale(x)} ${yScale(y)})`}
            r={selectId === id ? 4 : 3}
            fill={fillColor}
            fillOpacity={selectId === undefined || selectId === id ? 1 : 0.5}
            onClick={(e) => {
              setSelectId(selectId === id ? undefined : id);
              handleOnClick(id);
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              if (selectId !== id) {
                return;
              }

              handleInsertLoopMaterial(id);
              setSelectId(undefined);
            }}
          />
        );
      })}
    </g>
  );
}

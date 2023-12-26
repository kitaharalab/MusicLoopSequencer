import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getLoopByChord } from "@/api/loop";
import selectBlock from "@/api/selectBlock";
import { getLoopId, setLoopId } from "@/redux/apiParamSlice";

export default function ScatterPlot({
  boxSize,
  handleOnClick,
  partId,
  colors,
}) {
  const { width, height } = boxSize;
  const loopId = useSelector(getLoopId);
  const [selectId, setSelectId] = useState(loopId);
  const [positions, setPositions] = useState([]);
  const [hoverId, setHoverId] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const loopPositions = await selectBlock(partId);
      setPositions(loopPositions);

      if (loopId == null) {
        setSelectId(undefined);
        return;
      }

      const loopData = await getLoopByChord(partId, loopId);
      if (!loopData) {
        setSelectId(undefined);
        return;
      }

      const loopIds = loopPositions.map(({ id }) => id);
      const chord1LoopId = loopData[1];

      if (loopIds.includes(chord1LoopId)) {
        setSelectId(chord1LoopId);
      } else {
        setSelectId(undefined);
      }
    })();
  }, [loopId, partId]);

  const loopPositions = positions.filter(({ x, y }) => x && y);
  if (
    loopPositions.length === 0 ||
    loopPositions === undefined ||
    loopPositions === null ||
    !width ||
    !height ||
    !colors
  ) {
    return <g />;
  }

  const r = width * 0.02;
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(loopPositions, ({ x }) => x))
    .range([r, width - r])
    .nice(100);
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(loopPositions, ({ y }) => y))
    .range([height - r, r])
    .nice(100);

  return (
    <g>
      {loopPositions.map(({ x, y, id, excitement }) => (
        <circle
          key={id}
          transform={`translate(${xScale(x)} ${yScale(y)})`}
          r={selectId === id || hoverId === id ? r * 1.7 : r}
          stroke="black"
          strokeWidth={2}
          strokeOpacity={
            selectId === undefined || selectId === id || hoverId === id
              ? 0.8
              : 0.2
          }
          fill={colors[excitement]}
          fillOpacity={selectId === undefined || selectId === id ? 1 : 0.5}
          onClick={() => {
            const reSelect = selectId === id;
            setSelectId(reSelect ? undefined : id);
            dispatch(setLoopId(id));
            if (!reSelect) {
              handleOnClick(id);
            }
          }}
          onMouseOver={() => {
            setHoverId(id);
          }}
          onMouseLeave={() => {
            setHoverId(undefined);
          }}
        />
      ))}
    </g>
  );
}

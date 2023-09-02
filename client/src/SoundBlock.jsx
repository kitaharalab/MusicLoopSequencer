import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableContainer,
  TableCaption,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
} from "@chakra-ui/react";
import { setPos } from "./redux/blockCanvasSlice";
import { setMusicData } from "./redux/musicDataSlice";
import selectBlock from "./selectBlock";

function drawBackgroundOutline(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.lineWidth = "3";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

function drawBackgroundGrid(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = "1";
  ctx.strokeStyle = "gray";
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 4; j++) {
      ctx.strokeRect(i * 36, j * 50, 36, 50);
    }
  }
  ctx.fill();
}

function drawBackground(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
  drawBackgroundGrid(canvas);
  drawBackgroundOutline(canvas);
}

function drawSelectCell(canvas, measureId, partId) {
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 6;
  ctx.strokeRect(36 * measureId, 50 * partId, 36, 50);
  ctx.fill();
}

function drawPart(canvas, parts) {
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < 4; i++) {
    if (i === 0) {
      ctx.fillStyle = "red";
    } else if (i === 1) {
      ctx.fillStyle = "yellow";
    } else if (i === 2) {
      ctx.fillStyle = "green";
    } else {
      ctx.fillStyle = "blue";
    }
    for (let j = 0; j < 32; j++) {
      if (parts[i][j] != null) {
        ctx.fillRect(j * 36, i * 50, 36, 50);
      }
    }
  }
  ctx.fill();
}

export default function SoundBlock({ measure }) {
  // const selectedMeasureId = useSelector((state) => state.block.posRectX);
  // const selectedPartId = useSelector((state) => state.block.posRectY)
  const parts = useSelector((state) => state.sounds.parts);
  // const measureId = useSelector((state) => state.canvas.measureId);
  // const partId = useSelector((state) => state.canvas.partId);
  const dispatch = useDispatch();
  // const canvasRef = useRef();
  const initSelectMeasurePart = {
    measure: null,
    part: null,
  };
  const [selectMeasurePart, setSelectMeasurePart] = useState(
    initSelectMeasurePart,
  );
  const measureRange = [...Array(measure)].map((_, i) => i);
  // TODO
  const colorScale = ["red.200", "yellow.200", "green.200", "blue.200"];
  const colorFilter = (select) => (select ? null : "contrast(60%)");

  // useEffect(() => {
  //   drawBackground(canvasRef.current);
  //   drawSelectCell(canvasRef.current, measureId, partId);
  // }, [measureId, partId]);

  // useEffect(() => {
  //   drawBackground(canvasRef.current);
  // }, []);

  async function handleOnClickMeasurePart(event) {
    const { dataset } = event.target;
    const part = JSON.parse(dataset.part);
    const measure = JSON.parse(dataset.measure);
    const exist = JSON.parse(dataset.exist);

    if (!exist) {
      return;
    }

    const newSelectMeasurePart = {
      measure,
      part,
    };

    const selectSame =
      JSON.stringify(selectMeasurePart) ===
      JSON.stringify(newSelectMeasurePart);

    setSelectMeasurePart(
      selectSame ? initSelectMeasurePart : newSelectMeasurePart,
    );

    // const { offsetX, offsetY } = nativeEvent;
    // dispatch(setPos({ offsetX, offsetY }));
    const musicData = await selectBlock(part);
    const xCoordinate = musicData.x_coordinate;
    const yCoordinate = musicData.y_coordinate;
    const rangeList = musicData.range_lists;
    dispatch(setMusicData({ xCoordinate, yCoordinate, rangeList }));
  }

  useEffect(() => {
    if (parts.length === 0) {
      return;
    }

    console.log(parts);
    // const canvas = canvasRef.current;
    // drawBackground(canvas);
    // drawPart(canvas, parts);
  }, [parts]);

  return (
    <>
      {/* <canvas
        ref={canvasRef}
        width="1152"
        height="200"
        id="canvas2"
        onMouseDown={async ({ nativeEvent }) => {
          const { offsetX, offsetY } = nativeEvent;
          dispatch(setPos({ offsetX, offsetY }));
          const musicData = await selectBlock(Math.floor(offsetY / 50));
          const xCoordinate = musicData.x_coordinate;
          const yCoordinate = musicData.y_coordinate;
          const rangeList = musicData.range_lists;
          dispatch(setMusicData({ xCoordinate, yCoordinate, rangeList }));
        }}
      /> */}
      <TableContainer>
        <Table
          size="sm"
          style={{ borderCollapse: "separate", borderSpacing: "5px" }}
        >
          <TableCaption>caption</TableCaption>
          <Thead>
            <Tr>
              <Th>小節</Th>
              {measureRange.map((i) => (
                <th>{i}</th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>楽器</Td>
            </Tr>
            {parts.map(({ partid, sounds }) => {
              const existSound = measureRange.map((i) => sounds[i] != null);
              return (
                <Tr key={partid}>
                  <Td>{partid}</Td>
                  {existSound.map((exist, i) => {
                    const isSelect =
                      selectMeasurePart.measure === i &&
                      selectMeasurePart.part === partid;

                    return (
                      <Td
                        key={`${partid}-${i}`}
                        bgColor={exist ? colorScale[partid] : "white"}
                        borderRadius="8px"
                        filter={colorFilter(isSelect || !exist)}
                        data-part={partid}
                        data-measure={i}
                        data-exist={exist}
                        onClick={handleOnClickMeasurePart}
                      />
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}

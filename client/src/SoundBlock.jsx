import React, { useEffect, useState } from "react";
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
import { setMusicData } from "./redux/musicDataSlice";
import selectBlock from "./selectBlock";

export default function SoundBlock({ measure }) {
  const parts = useSelector((state) => state.sounds.parts);
  const dispatch = useDispatch();
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
  }, [parts]);

  return (
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
  );
}

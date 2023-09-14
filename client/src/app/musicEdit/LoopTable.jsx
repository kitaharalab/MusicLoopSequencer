import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableContainer,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
} from "@chakra-ui/react";
import axios from "axios";
import { setMusicData } from "../../redux/musicDataSlice";
import selectBlock from "./selectBlock";

export default function LoopTable({ measure }) {
  const projectId = useSelector((state) => state.projectId.projectId);
  const songId = useSelector((state) => state.songId.songId);
  const [parts, setParts] = useState();
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
    const url = `${
      import.meta.env.VITE_SERVER_URL
    }/projects/${projectId}/songs/${songId}`;
    axios
      .get(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const { data } = response;
        setParts(data.parts);
      });
    console.log(songId);
  }, [songId]);

  if (parts === undefined) {
    return <div>loading</div>;
  }

  if (parts === null) {
    return <div>nothing</div>;
  }

  return (
    <TableContainer>
      <Table
        size="sm"
        style={{
          borderCollapse: "separate",
          borderSpacing: "5px",
          width: `${measure * 32}px`,
        }}
        layout="fixed"
      >
        <Thead>
          <Tr>
            {measureRange.map((i) => (
              <Th key={i} textAlign="center">
                {i + 1}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {parts?.map(({ partid, sounds }) => {
            const existSound = measureRange.map((i) => sounds[i] != null);
            return (
              <Tr key={partid}>
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
                      height="30px"
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

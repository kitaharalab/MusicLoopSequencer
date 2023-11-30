import {
  Table,
  TableContainer,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  useTheme,
} from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import getParts from "@/api/getParts";
import { sendCheckSongLoopLog } from "@/api/log";
import selectBlock from "@/api/selectBlock";
import { getSongDetail } from "@/api/song";
import { setLoopPositions } from "@/redux/musicDataSlice";
import { setSelectedLoop } from "@/redux/soundsSlice";

export default function LoopTable({ projectId, measure }) {
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

  useEffect(() => {
    async function updateSongDetail() {
      const songDetail = await getSongDetail(projectId, songId);
      setParts(songDetail);
    }
    updateSongDetail();

    return () => {
      dispatch(setLoopPositions([]));
    };
  }, [songId]);

  const [partsInfo, setPartsInfo] = useState([]);

  useEffect(() => {
    async function initPartsInfo() {
      const partData = await getParts();
      setPartsInfo(partData);
    }
    initPartsInfo();
  }, []);

  if (parts === undefined) {
    return <div>loading</div>;
  }

  if (parts === null) {
    return <div>nothing</div>;
  }

  const measureRange = [...Array(measure)].map((_, i) => i);

  const theme = useTheme();
  const baseColor = partsInfo.map(
    ({ name }) => theme.colors.part.light[name.toLowerCase()],
  );
  const colorScale = d3.scaleOrdinal().range(baseColor);

  const borderColor = partsInfo.map(
    ({ name }) => theme.colors.part.dark[name.toLowerCase()],
  );
  const borderColorScale = d3.scaleOrdinal().range(borderColor);

  const colorFilter = (select) => (select ? null : "contrast(60%)");
  async function handleOnClickMeasurePart(event) {
    const { dataset } = event.target;
    const part = JSON.parse(dataset.part);
    const measureId = JSON.parse(dataset.measure) - 1;
    const loopId =
      dataset.loop !== undefined ? JSON.parse(dataset.loop) : undefined;

    if (loopId !== undefined) {
      sendCheckSongLoopLog(projectId, songId, part, measureId, loopId);
    }

    const newSelectMeasurePart = {
      measure: measureId,
      part,
    };
    const selectSame =
      JSON.stringify(selectMeasurePart) ===
      JSON.stringify(newSelectMeasurePart);
    const selectSamePart = part === selectMeasurePart.part;

    setSelectMeasurePart(
      selectSame ? initSelectMeasurePart : newSelectMeasurePart,
    );

    dispatch(
      setSelectedLoop(
        selectSame ? initSelectMeasurePart : newSelectMeasurePart,
      ),
    );

    if (selectSamePart) {
      return;
    }

    const musicData = await selectBlock(part);
    dispatch(setLoopPositions(musicData));
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
          {parts?.map(({ partId, sounds }) => (
            <Tr key={partId}>
              {sounds.map((loopId, i) => {
                const exist = loopId != null;
                const isSelect =
                  selectMeasurePart.measure === i &&
                  selectMeasurePart.part === partId;

                return (
                  <Td
                    key={`${partId}-${i}`}
                    bgColor={exist || isSelect ? colorScale(partId) : "white"}
                    borderColor={borderColorScale(partId)}
                    borderWidth={isSelect ? 3 : 1}
                    borderRadius="8px"
                    filter={colorFilter(isSelect || !exist)}
                    data-part={partId}
                    data-measure={i + 1}
                    data-exist={exist}
                    data-loop={loopId}
                    onClick={handleOnClickMeasurePart}
                    height="30px"
                  />
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

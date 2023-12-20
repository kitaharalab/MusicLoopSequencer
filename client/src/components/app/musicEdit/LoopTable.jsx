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
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import getParts from "@/api/getParts";
import { sendCheckSongLoopLog } from "@/api/log";
import selectBlock from "@/api/selectBlock";
import { getSongDetail } from "@/api/song";
import { getApiParams, setMeasure, setPartId } from "@/redux/apiParamSlice";
import { setLoopPositions } from "@/redux/musicDataSlice";
import { setSelectedLoop } from "@/redux/soundsSlice";

export default function LoopTable({ measure }) {
  const { projectId, songId } = useSelector(getApiParams);
  const [parts, setParts] = useState();
  const dispatch = useDispatch();
  const theme = useTheme();
  const initSelectMeasurePart = {
    measure: null,
    part: null,
  };

  const [hoverMeasurePart, setHoverMeasurePart] = useState(
    initSelectMeasurePart,
  );
  const selectMeasurePart = useRef(initSelectMeasurePart);

  useEffect(() => {
    async function updateSongDetail() {
      const songDetail = await getSongDetail(projectId, songId);
      setParts(songDetail);
    }
    updateSongDetail();
    selectMeasurePart.current = initSelectMeasurePart;

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
      JSON.stringify(selectMeasurePart.current) ===
      JSON.stringify(newSelectMeasurePart);
    const selectSamePart = part === selectMeasurePart.current.part;

    selectMeasurePart.current = selectSame
      ? initSelectMeasurePart
      : newSelectMeasurePart;

    dispatch(setMeasure(measureId + 1));
    dispatch(setPartId(part));
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

  function onLoopHover(e) {
    const { dataset } = e.target;
    const part = JSON.parse(dataset.part);
    const measureId = JSON.parse(dataset.measure) - 1;

    const newSelectMeasurePart = {
      measure: measureId,
      part,
    };

    setHoverMeasurePart(newSelectMeasurePart);
  }

  return (
    <TableContainer height="100%" overflowX="unset" overflowY="unset">
      <Table
        style={{
          borderCollapse: "separate",
          borderSpacing: "5px",
          width: `${measure * 32}px`,
        }}
      >
        <Thead>
          <Tr>
            <Th
              textAlign="center"
              padding={0}
              position="sticky"
              left={0}
              zIndex="docked"
              bgColor="white"
            >
              楽器名
            </Th>
            {measureRange.map((i) => (
              <Th key={i} textAlign="center" padding={0}>
                {i + 1}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {parts?.map(({ partId, sounds }) => {
            const partName = partsInfo.find(({ id }) => id === partId).name;
            return (
              <Tr key={partId} bgColor="white">
                <Td position="sticky" left={0} zIndex="docked" bgColor="white">
                  {partName}
                </Td>
                {sounds.map((loopId, i) => {
                  const exist = loopId != null;
                  const isSelect =
                    selectMeasurePart.current.measure === i &&
                    selectMeasurePart.current.part === partId;
                  const isHover =
                    hoverMeasurePart.measure === i &&
                    hoverMeasurePart.part === partId;
                  const isBackgroundHighlight = isSelect || isHover || exist;

                  return (
                    <Td
                      key={`${partId}-${i}`}
                      bgColor={
                        isBackgroundHighlight
                          ? theme.colors.part.light[partName.toLowerCase()]
                          : "white"
                      }
                      borderColor={
                        isSelect
                          ? theme.colors.part.dark[partName.toLowerCase()]
                          : "gray.200"
                      }
                      borderWidth={3}
                      borderRadius="8px"
                      filter={colorFilter(isSelect || isHover || !exist)}
                      data-part={partId}
                      data-measure={i + 1}
                      data-exist={exist}
                      data-loop={loopId}
                      onClick={handleOnClickMeasurePart}
                      onMouseEnter={onLoopHover}
                      onMouseLeave={() =>
                        setHoverMeasurePart(initSelectMeasurePart)
                      }
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

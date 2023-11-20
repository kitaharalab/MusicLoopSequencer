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
import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { auth } from "../../components/authentication/firebase";
import { setLoopPositions } from "../../redux/musicDataSlice";
import { setSelectedLoop } from "../../redux/soundsSlice";

import selectBlock from "./selectBlock";

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
    if (songId === null || songId === undefined) {
      return () => {
        dispatch(setLoopPositions([]));
      };
    }

    const url = `${
      import.meta.env.VITE_SERVER_URL
    }/projects/${projectId}/songs/${songId}`;
    axios
      .get(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const { data } = response;
        setParts(data.parts);
      });

    return () => {
      dispatch(setLoopPositions([]));
    };
  }, [songId]);

  if (parts === undefined) {
    return <div>loading</div>;
  }

  if (parts === null) {
    return <div>nothing</div>;
  }

  const measureRange = [...Array(measure)].map((_, i) => i);

  const baseColor = ["red.200", "yellow.200", "green.200", "blue.200"];
  const colorScale = d3.scaleOrdinal().range(baseColor);

  const borderColor = ["red.400", "yellow.400", "green.400", "blue.400"];
  const borderColorScale = d3.scaleOrdinal().range(borderColor);

  const colorFilter = (select) => (select ? null : "contrast(60%)");
  async function handleOnClickMeasurePart(event) {
    const { dataset } = event.target;
    const part = JSON.parse(dataset.part);
    const measureId = JSON.parse(dataset.measure) - 1;
    const loopId =
      dataset.loop !== undefined ? JSON.parse(dataset.loop) : undefined;

    if (loopId !== undefined) {
      // start log
      const url = new URL(
        `/projects/${projectId}/songs/${songId}/parts/${part}/measures/${measureId}/musicloops/${loopId}`,
        import.meta.env.VITE_SERVER_URL,
      );
      const idToken = await auth.currentUser?.getIdToken();
      axios.post(
        url,
        { check: true },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );
      // end log
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
                    bgColor={exist ? colorScale(partId) : "white"}
                    borderColor={borderColorScale(partId)}
                    borderWidth={isSelect ? 3 : 0}
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

import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function MusicInstrumentTable() {
  const [partName, setPartName] = useState([]);

  useEffect(() => {
    const url = `${import.meta.env.VITE_SERVER_URL}/parts`;
    axios.get(url).then((response) => {
      const { data } = response;
      setPartName(data.map(({ name }) => name));
    });
  }, []);

  return (
    <TableContainer>
      <Table
        size="sm"
        style={{ borderCollapse: "separate", borderSpacing: "5px" }}
      >
        <Thead>
          <Tr>
            <Th>楽器名</Th>
          </Tr>
        </Thead>
        <Tbody>
          {partName.map((name) => (
            <Tr key={name} height="30px">
              <Td textAlign="center">{name}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

import React from "react";
import { Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { useSelector } from "react-redux";

export default function MusicInstrumentTable() {
  const parts = useSelector((state) => state.sounds.parts);
  const partName = parts.map(({ partid }) => partid);

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
        <Tbody textAlign="center">
          {partName.map((name) => (
            <Tr key={name} height="30px">
              {name}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

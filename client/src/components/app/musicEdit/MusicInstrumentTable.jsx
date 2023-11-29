import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import getParts from "@/api/getParts";

export default function MusicInstrumentTable() {
  const [partName, setPartName] = useState([]);

  useEffect(() => {
    async function setPartNames() {
      const partData = await getParts();
      setPartName(partData?.map(({ name }) => name));
    }
    setPartNames();
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
          {partName &&
            partName.map((name) => (
              <Tr key={name} height="30px">
                <Td textAlign="center">{name}</Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

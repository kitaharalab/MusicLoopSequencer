import {
  Box,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import Header from "./app/Header";
import Controls from "./app/controls/Controls";
import ExcitementCurve from "./app/excitementCurve/ExcitementCurve";
import LoopTable from "./app/musicEdit/LoopTable";
import LoopMaterialView from "./app/musicEdit/loopMaterisl/LoopMaterialView";

function App() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectid");

  const songId = useSelector((state) => state.songId.songId);

  return (
    <>
      <Header projectName={projectId} projectId={projectId} songId={songId} />
      <Controls projectId={projectId} />

      <Box className="excitement-curve-container" paddingY={4} height="40vh">
        <ExcitementCurve measure={32} />
      </Box>

      <Box>
        <Flex
          width="100%"
          height="100%"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Box minWidth={{ base: "30%" }}>
            <LoopMaterialView projectId={projectId} songId={songId} />
          </Box>
          <Card overflow="auto" width={{ base: "100%", md: "65%" }}>
            <CardHeader>music</CardHeader>
            <Divider />
            <CardBody overflow="auto" height="100%">
              <LoopTable projectId={projectId} measure={32} />
            </CardBody>
          </Card>
        </Flex>
      </Box>
    </>
  );
}

export default App;

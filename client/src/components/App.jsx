import { Box, Flex, Card, CardBody, CardHeader } from "@chakra-ui/react";
import React from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";

import Header from "./app/Header";
import Controls from "./app/controls/Controls";
import ExcitementCurve from "./app/excitementCurve/ExcitementCurve";
import LoopTable from "./app/musicEdit/LoopTable";
import LoopMaterialView from "./app/musicEdit/loopMaterisl/LoopMaterialView";

import { setProjectId } from "@/redux/apiParamSlice";

function App() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectid");
  const dispatch = useDispatch();
  dispatch(setProjectId(projectId));

  return (
    <>
      <Header />
      <Controls />

      <Card height="40vh" marginTop={3}>
        <CardHeader paddingBottom={0}>盛り上がり度曲線を描く</CardHeader>
        <CardBody height="100%">
          <Box className="excitement-curve-container" height="100%">
            <ExcitementCurve measure={32} />
          </Box>
        </CardBody>
      </Card>

      <Box marginTop={3}>
        <Flex
          width="100%"
          height="100%"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Box minWidth={{ base: "30%" }}>
            <LoopMaterialView />
          </Box>
          <Card overflow="auto" width={{ base: "100%", lg: "65%" }}>
            <CardHeader>music</CardHeader>
            <CardBody overflow="auto" height="100%" paddingLeft={0}>
              <LoopTable measure={32} />
            </CardBody>
          </Card>
        </Flex>
      </Box>
    </>
  );
}

export default App;

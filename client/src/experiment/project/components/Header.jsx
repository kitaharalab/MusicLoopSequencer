import { Heading, Text, Center, Box } from "@chakra-ui/react";
import React from "react";

import RestButton from "./RestButton";

export default function Header({ projectName }) {
  return (
    <Heading as="h1" marginY={4}>
      <Box position="relative">
        <Box position="absolute">
          <RestButton />
        </Box>
      </Box>

      <Center>
        <Text>{projectName}</Text>
      </Center>
    </Heading>
  );
}

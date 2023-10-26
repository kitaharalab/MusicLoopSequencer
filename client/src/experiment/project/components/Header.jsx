import { Heading, Text, Button, Center, Box } from "@chakra-ui/react";
import React from "react";

export default function Header({ projectName }) {
  return (
    <Heading as="h1" marginY={4}>
      <Box position="relative">
        <Button position="absolute" top={1}>
          休憩する
        </Button>
      </Box>

      <Center>
        <Text>{projectName}</Text>
      </Center>
    </Heading>
  );
}

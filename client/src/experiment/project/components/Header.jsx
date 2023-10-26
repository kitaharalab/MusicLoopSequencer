import { Flex, Heading, Text, Spacer, Button } from "@chakra-ui/react";
import React from "react";

export default function Header({ projectName }) {
  return (
    <Heading as="h1" marginY={4}>
      <Flex>
        <Button>休憩する</Button>
        <Spacer />
        <Text>{projectName}</Text>
        <Spacer />
      </Flex>
    </Heading>
  );
}

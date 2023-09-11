import React from "react";
import { Box, Flex, Heading, Text, Spacer } from "@chakra-ui/react";
import ButtonLink from "../../components/Link/ButtonLink";

export default function Header() {
  return (
    <Heading as="h1" marginY={4}>
      <Flex>
        <ButtonLink to="/">Back to Project</ButtonLink>
        <Spacer />
        <Text>project name</Text>
        <Spacer />
      </Flex>
    </Heading>
  );
}

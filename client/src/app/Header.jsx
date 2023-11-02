import { ArrowBackIcon } from "@chakra-ui/icons";
import { Flex, Heading, Text, Spacer } from "@chakra-ui/react";
import React from "react";

import ButtonLink from "../../components/Link/ButtonLink";

export default function Header({ projectName }) {
  return (
    <Heading as="h1" marginY={4}>
      <Flex>
        <ButtonLink to="/">
          <ArrowBackIcon />
        </ButtonLink>
        <Spacer />
        <Text>{projectName}</Text>
        <Spacer />
      </Flex>
    </Heading>
  );
}

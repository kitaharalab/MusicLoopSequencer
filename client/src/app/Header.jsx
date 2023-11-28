import { ArrowBackIcon } from "@chakra-ui/icons";
import { Flex, Heading, Text, Spacer, Box } from "@chakra-ui/react";
import React from "react";

import ButtonLink from "@/components/Link/ButtonLink";
import RestButton from "@/components/RestButton";

export default function Header({ projectName, projectId, songId }) {
  return (
    <Heading as="h1" marginY={4}>
      <Flex>
        <Box>
          <ButtonLink to="/">
            <ArrowBackIcon />
          </ButtonLink>
        </Box>
        <Spacer />
        <Text>{projectName}</Text>
        <Spacer />
        <Box>
          <RestButton projectId={projectId} songId={songId} />
        </Box>
      </Flex>
    </Heading>
  );
}

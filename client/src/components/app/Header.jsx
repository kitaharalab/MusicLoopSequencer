import { ArrowBackIcon } from "@chakra-ui/icons";
import { Flex, Heading, Text, Spacer, Box } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";

import ButtonLink from "@/components/Link/ButtonLink";
import RestButton from "@/components/RestButton";
import { getProjectId, getSongId } from "@/redux/apiParamSlice";

export default function Header() {
  const projectId = useSelector(getProjectId);
  const songId = useSelector(getSongId);
  return (
    <Heading as="h1" marginY={4}>
      <Flex>
        <Box>
          <ButtonLink to="/">
            <ArrowBackIcon />
          </ButtonLink>
        </Box>
        <Spacer />
        <Text>{projectId}</Text>
        <Spacer />
        <Box>
          <RestButton projectId={projectId} songId={songId} />
        </Box>
      </Flex>
    </Heading>
  );
}

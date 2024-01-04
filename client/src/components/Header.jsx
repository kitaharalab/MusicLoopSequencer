import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import React from "react";

import { signOut, useUser } from "./Auth";
import ButtonLink from "./Link/ButtonLink";

function AuthButton() {
  const user = useUser();
  return user ? (
    <Button
      onClick={() => {
        signOut();
      }}
    >
      Sign Out
    </Button>
  ) : (
    <ButtonLink to={"/signin"}>Sign in</ButtonLink>
  );
}

export default function Header() {
  return (
    <Box px="4" bgColor="purple.400">
      <Flex
        as="header"
        py="4"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading as="h1">Music Loop Sequencer</Heading>
        <AuthButton />
      </Flex>
    </Box>
  );
}

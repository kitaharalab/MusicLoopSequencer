import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import React from "react";

import { signOut, signIn, useUser } from "./Auth";

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
    <Button
      onClick={() => {
        signIn();
      }}
    >
      Sign in
    </Button>
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

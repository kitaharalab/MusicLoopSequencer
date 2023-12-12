import { Box, Button, Container, Flex, Heading } from "@chakra-ui/react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import React, { useEffect, useState } from "react";

import { auth } from "@/api/authentication/firebase";

function AuthButton() {
  const [user, setUser] = useState(null);

  function handleClick() {
    signInWithPopup(auth, new GoogleAuthProvider())
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return unsubscribe;
  }, []);

  return user === null || user === undefined ? (
    <Button onClick={handleClick}>Sign in</Button>
  ) : (
    <Button
      onClick={() => {
        signOut(auth);
      }}
    >
      Sign Out
    </Button>
  );
}

export default function Header() {
  return (
    <Box px="4" bgColor="purple.400">
      <Container maxW="container.lg">
        <Flex
          as="header"
          py="4"
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading as="h1">Music Loop Sequencer</Heading>
          <AuthButton />
        </Flex>
      </Container>
    </Box>
  );
}

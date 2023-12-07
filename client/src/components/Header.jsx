import { Box, Button, Flex, Heading, Spacer, Text } from "@chakra-ui/react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import React, { useEffect, useState } from "react";

import { auth } from "@/api/authentication/firebase";

export default function Header() {
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

  return (
    <Heading marginBottom={3} paddingX={2}>
      <Flex justifyContent="space-between" alignItems="center">
        <Text
          padding={2}
          background="purple.900"
          borderRadius="20"
          textColor="white"
        >
          Music Loop Sequencer
        </Text>
        <Spacer />
        {user === null || user === undefined ? (
          <Box>
            <Button onClick={handleClick}>sign in</Button>
          </Box>
        ) : (
          <Box>
            <Button
              onClick={() => {
                signOut(auth);
              }}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </Flex>
    </Heading>
  );
}

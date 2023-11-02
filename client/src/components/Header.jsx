import { Box, Button, Divider, Flex, Heading, Spacer } from "@chakra-ui/react";
import { onAuthStateChanged, getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";

import Link from "../../components/Link/Link";

export default function Header() {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return unsubscribe;
  }, []);

  return (
    <Heading>
      <Flex>
        Music Loop Sequencer
        <Spacer />
        {user === null || user === undefined ? (
          <Box>
            <Link to="/signin" padding={3}>
              Sign in
            </Link>
            <Link to="/signup" padding={3}>
              Sign up
            </Link>
          </Box>
        ) : (
          <Button
            onClick={() => {
              signOut(auth);
            }}
          >
            Sign Out
          </Button>
        )}
      </Flex>
      <Divider />
    </Heading>
  );
}

import { Box, Divider, Flex, Heading, Spacer } from "@chakra-ui/react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
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
          <div>signout</div>
        )}
      </Flex>
      <Divider />
    </Heading>
  );
}

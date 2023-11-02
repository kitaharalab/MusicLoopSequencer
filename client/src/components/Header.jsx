import { Box, Divider, Flex, Heading, Spacer } from "@chakra-ui/react";
import React from "react";

import Link from "../../components/Link/Link";

export default function Header() {
  return (
    <Heading>
      <Flex>
        Music Loop Sequencer
        <Spacer />
        <Box>
          <Link to="/signin" padding={3}>
            Sign in
          </Link>
          <Link to="/signup" padding={3}>
            Sign up
          </Link>
        </Box>
      </Flex>
      <Divider />
    </Heading>
  );
}

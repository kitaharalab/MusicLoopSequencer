import { Link as ChakraLink } from "@chakra-ui/react";
import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Link as ReactRouterLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
export default function Link({ children, ...res }) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ChakraLink as={ReactRouterLink} {...res}>
      {children}
    </ChakraLink>
  );
}

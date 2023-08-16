/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Button } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
export default function ButtonLink({ children, ...res }) {
  return (
    <Button as={ReactRouterLink} {...res}>
      {children}
    </Button>
  );
}

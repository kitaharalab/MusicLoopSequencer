/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import { Button } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";

export default function ButtonLink({ children, ...res }) {
  return (
    <Button as={ReactRouterLink} {...res}>
      {children}
    </Button>
  );
}

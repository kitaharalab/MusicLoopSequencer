/* eslint-disable import/no-extraneous-dependencies */
import {
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Button,
  Box,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Navigate } from "react-router-dom";

import { auth } from "@/api/authentication/firebase";

export default function SignIn() {
  const [user, setUser] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    flushSync(() => {
      setCreating(true);
    });
    const { email, password } = event.target.elements;
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } catch (error) {
      console.log(error);
      setUser(undefined);
    }

    setCreating(false);
  }

  if (user !== null) {
    return <Navigate to="/" />;
  }

  return (
    <Container
      centerContent
      justifyContent="center"
      height="100vh"
      minWidth="50%"
    >
      <Card width="100%">
        <CardHeader>
          <Heading textAlign="center">ログイン</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel htmlFor="signin-email">email</FormLabel>
              <Input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="username"
              />
              <FormLabel htmlFor="signin-password">password</FormLabel>
              <Input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
              />
            </FormControl>
            <Box marginTop={3}>
              <Button type="submit" isLoading={creating} width="100%">
                ログイン
              </Button>
            </Box>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
}

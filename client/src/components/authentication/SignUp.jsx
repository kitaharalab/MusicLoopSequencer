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
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Navigate } from "react-router-dom";

import Link from "../../../components/Link/Link";

import { auth } from "./firebase";

export default function SignUp() {
  const [user, setUser] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      axios.post(`${import.meta.env.VITE_SERVER_URL}/users`, {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
      });
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    flushSync(() => {
      setCreating(true);
    });
    const { email, password } = event.target.elements;
    try {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
    } catch (error) {
      console.log(error);
      setUser(undefined);
    }

    setCreating(false);
  }

  if (user !== null && user !== undefined) {
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
          <Heading textAlign="center">ユーザー登録</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <FormControl isRequired isInvalid={user === undefined}>
              <FormLabel htmlFor="signup-email">email</FormLabel>
              <Input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="username"
              />
              <FormLabel htmlFor="signup-password">password</FormLabel>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
              />
              <FormErrorMessage>
                <Text>既に登録されているかもしれません．</Text>
                <Link to="/signin">ログインはこちら</Link>
              </FormErrorMessage>
            </FormControl>
            <Box marginTop={3}>
              <Button type="submit" isLoading={creating} width="100%">
                create
              </Button>
            </Box>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
}

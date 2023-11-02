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
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Navigate } from "react-router-dom";

export default function SignUp() {
  const auth = getAuth();
  const [user, setUser] = useState();
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
      await createUserWithEmailAndPassword(auth, email.value, password.value);
    } catch (error) {
      console.log(error);
      signInWithEmailAndPassword(auth, email.value, password.value).then(
        (userCredential) => {
          const { user } = userCredential;
          setUser(user);
        },
      );
    }

    setCreating(false);
  }

  if (user !== null) {
    return (
      // <div>
      //   {user !== null && <Navigate to="/" />}
      //   already sign in
      //   <div>
      //     <button
      //       type="button"
      //       onClick={() => {
      //         signOut(auth).then(() => {
      //           console.log("sign out");
      //         });
      //       }}
      //     >
      //       sign out
      //     </button>
      //   </div>
      // </div>
      <Navigate to="/test" />
    );
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
            <FormControl isRequired>
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

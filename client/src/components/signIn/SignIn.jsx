import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";

import { signIn, useUser } from "../Auth";

import registerUser from "@/api/registerUser";

function SignInUI({ handleSignIn }) {
  return (
    <Container>
      <Stack spacing={8}>
        <Box textAlign="center" marginTop={8}>
          <Heading size="sm">IDを入力してログイン</Heading>
        </Box>
        <Box>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const inputIdEl = event.target.elements.id;
              const userOwnId = inputIdEl.value;
              handleSignIn(userOwnId);
              inputIdEl.value = "";
            }}
          >
            <Stack spacing="6">
              <FormControl isRequired>
                <FormLabel>ID</FormLabel>
                <Input type="text" name="id" />
              </FormControl>

              <Button type="submit">Sign in with Google</Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
}

export default function SignIn() {
  const user = useUser();
  const [userOwnId, setUserOwnId] = useState("");

  if (user) {
    registerUser(userOwnId);
    return <Navigate to="/" />;
  }

  return (
    <SignInUI
      handleSignIn={(inputUserOwnId) => {
        setUserOwnId(inputUserOwnId);
        signIn();
      }}
    />
  );
}

import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { signIn as firebaseSignIn, signOut, useUser } from "../Auth";

import checkSignIn from "@/api/authentication/checkSignIn";
import registerUser from "@/api/authentication/registerUser";

function SignInUI({ handleSignIn, isError }) {
  return (
    <Container>
      <Stack spacing={8}>
        <Box textAlign="center" marginTop={8}>
          <Heading size="sm">IDを入力してログイン</Heading>
        </Box>
        <Box>
          <FormControl isInvalid={isError}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const { elements } = event.target;
                const userOwnId = elements.id.value;
                const wantRegister = elements.register.checked;
                handleSignIn(userOwnId, wantRegister);

                elements.id.value = "";
              }}
            >
              <Stack spacing="6">
                <FormControl isRequired>
                  <FormLabel>ID</FormLabel>
                  <Input type="text" name="id" />
                </FormControl>
                <FormControl isInvalid={isError}>
                  <Checkbox name="register">IDを登録する</Checkbox>
                  <FormHelperText>
                    以前にIDを登録したことがある場合は上書きされます
                  </FormHelperText>
                  <FormErrorMessage>
                    IDを忘れた場合、このボタンをクリックして再度ログインしてください。
                  </FormErrorMessage>
                </FormControl>

                <Button type="submit">Sign in with Google</Button>
              </Stack>
            </form>

            <FormErrorMessage>
              ログインに失敗しました。GoogleアカウントやIDを確認してください
            </FormErrorMessage>
          </FormControl>
        </Box>
      </Stack>
    </Container>
  );
}

export default function SignIn() {
  const user = useUser();
  const [userOwnId, setUserOwnId] = useState("");
  const [wantRegister, setWantRegister] = useState("");
  const isError = useRef(false);
  const navigate = useNavigate();

  async function signIn() {
    const canSignIn = await checkSignIn(userOwnId);
    if (canSignIn) {
      navigate("/");
    } else {
      signOut();
      isError.current = true;
    }
  }

  async function signInWithRegister() {
    const registered = await registerUser(userOwnId);
    if (registered) {
      navigate("/");
    } else {
      signOut();
      isError.current = true;
    }
  }

  useEffect(() => {
    if (!user || !userOwnId) {
      return;
    }

    if (wantRegister) {
      signInWithRegister();
    } else {
      signIn();
    }
  }, [user, userOwnId]);

  return (
    <SignInUI
      handleSignIn={(inputUserOwnId, wantRegister) => {
        setUserOwnId(inputUserOwnId);
        setWantRegister(wantRegister);
        firebaseSignIn();
      }}
      isError={isError.current}
    />
  );
}

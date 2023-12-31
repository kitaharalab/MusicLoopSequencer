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
import { signIn, useUser } from "../Auth";
import { Navigate } from "react-router-dom";

function SignInUI() {
  return (
    <Container>
      <Stack spacing={8}>
        <Box textAlign="center" marginTop={8}>
          <Heading size={"sm"}>IDを入力してログイン</Heading>
        </Box>
        <Box>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const inputIdEl = event.target.elements.id;
              console.log(inputIdEl.value);
              inputIdEl.value = "";
              signIn();
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
  return user ? <Navigate to={"/"} /> : <SignInUI />;
}

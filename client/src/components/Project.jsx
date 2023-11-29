/* eslint-disable import/no-extraneous-dependencies */
import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Text,
  Flex,
  Spacer,
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";

import { auth } from "../api/authentication/firebase";

import Link from "./Link/Link";

function SignInModal({ isOpen, onOpen, onClose, setUser }) {
  const [isPending, setPending] = useState(false);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>サインインする</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Button
            disabled={isPending}
            onClick={async () => {
              flushSync(() => {
                setPending(true);
              });
              const result = await signInWithPopup(auth, googleProvider);
              setUser(result?.user);
              onClose();
            }}
          >
            Sign in with Google
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Project() {
  const [projects, setProjects] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(auth.currentUser);

  async function createNewProject() {
    const url = `${import.meta.env.VITE_SERVER_URL}/projects`;
    const idToken = await auth.currentUser?.getIdToken();
    const response = await axios
      .post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      )
      .catch(() => ({ data: [] }));
    const { data } = response;
    setProjects([...projects, data]);
  }

  async function getProjects() {
    const url = `${import.meta.env.VITE_SERVER_URL}/projects`;
    const idToken = await auth.currentUser?.getIdToken();
    const response = await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      .catch(() => ({ data: [] }));
    const { data } = response;
    setProjects(data);
  }

  useEffect(() => {
    getProjects();

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    getProjects();
  }, [user]);

  return (
    <Box id="project">
      <Flex>
        <Card bgColor="darkslategrey" align="center" width="30vw">
          <CardBody>
            <Box>
              <IconButton
                type="button"
                onClick={() => {
                  if (!auth.currentUser) {
                    onOpen();
                  } else {
                    createNewProject();
                  }
                }}
                icon={<AddIcon />}
                width="25%"
                alignSelf="center"
              />
            </Box>
            <Text color="white">プロジェクトを作る</Text>
          </CardBody>
        </Card>
        <Spacer />
        <Card bgColor="darkslategrey" align="center" width="30vw">
          <Link to="/experiment">
            <CardBody>
              <CardHeader>
                <Text color="white">experiment</Text>
              </CardHeader>
            </CardBody>
          </Link>
        </Card>
      </Flex>

      <SignInModal
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        setUser={setUser}
      />

      {projects === null ? (
        <Spinner />
      ) : (
        <SimpleGrid minChildWidth="30vw" spacing={4} marginTop={2}>
          {projects.length === 0 ? (
            <Card>
              <CardHeader>プロジェクトをまだ作っていないようです👀</CardHeader>
              <CardBody>
                <Box>
                  <Text>サインインしてプロジェクトを作成してみましょう</Text>
                </Box>
                {!user && (
                  <Button variant="link" onClick={onOpen}>
                    サインインはこちら
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            projects?.map(({ id, name }) => (
              <Card key={id} width="30vw">
                <Link to={`App?projectid=${id}`}>
                  <CardHeader>{name}</CardHeader>
                </Link>
              </Card>
            ))
          )}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default Project;

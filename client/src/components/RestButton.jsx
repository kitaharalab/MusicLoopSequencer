import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";

import { auth } from "./authentication/firebase";

export default function RestButton({ projectId, songId }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function handleClose() {
    const url = `${
      import.meta.env.VITE_SERVER_URL
    }/projects/${projectId}/songs/${songId}`;
    const idToken = await auth.currentUser?.getIdToken();
    await axios.post(
      url,
      { rest: false },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    );
    onClose();
  }

  return (
    <>
      <Button
        onClick={async () => {
          // /projects/<int:projectid>/songs/<int:songid></int:songid>
          const url = `${
            import.meta.env.VITE_SERVER_URL
          }/projects/${projectId}/songs/${songId}`;
          const idToken = await auth.currentUser?.getIdToken();
          await axios.post(
            url,
            { rest: true },
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            },
          );
          onOpen();
        }}
      >
        休憩する
      </Button>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleClose}
        isCentered
      >
        <ModalOverlay background="blackAlpha.300" backdropFilter="blur(8px)" />

        <ModalContent>
          <ModalHeader>休憩中</ModalHeader>
          <ModalCloseButton />
          <ModalBody />
          <ModalFooter>
            <Button onClick={handleClose}>作業に戻る</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

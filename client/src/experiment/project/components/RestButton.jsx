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
import React from "react";

export default function RestButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  function handleClose() {
    onClose();
  }

  return (
    <>
      <Button onClick={onOpen}>休憩する</Button>
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

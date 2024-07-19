import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

export default function ModalApp({
  isOpen,
  onOpenChange,
  onClose,
  title,
  content,
  actionButtonLabel,
  actionButtonOnClick,
  permission,
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
          <ModalBody>
            <p>{content}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="ghost" onPress={onClose}>
              Close
            </Button>
            <Button
              color="primary"
              onPress={() => {
                actionButtonOnClick();
                onClose();
              }}
              isDisabled={permission === true}
            >
              {actionButtonLabel}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}

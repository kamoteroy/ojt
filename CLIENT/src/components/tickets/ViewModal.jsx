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

const ImageModal1 = ({ isOpen, onOpenChange, onClose, title, content }) => {
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
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

function ViewModal({
  isOpen,
  onOpenChange,
  onClose,
  title,
  content,
  actionButtonLabel,
  actionButtonOnClick,
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
          <ModalBody>
            <>{content}</>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="ghost" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}

export default ViewModal;

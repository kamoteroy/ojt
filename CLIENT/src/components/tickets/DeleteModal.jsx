import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
  Link,
} from "@nextui-org/react";

const DeleteModal = ({ isOpen, onOpenChange, productId, details }) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={true}
        isKeyboardDismissDisabled={true}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                Product Details
              </ModalHeader>
              <ModalBody>
                {details && (
                  <>
                    <Input
                      type="text"
                      label="Product Name"
                      value={details.Name || ""}
                      readOnly
                    />
                    <Input
                      type="text"
                      label="Description"
                      value={details.Description || ""}
                      readOnly
                    />
                    <Input
                      type="text"
                      label="Category"
                      value={details.Category || ""}
                      readOnly
                    />
                    <Input
                      type="text"
                      label="Price"
                      value={details.Price || ""}
                      readOnly
                    />
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="ghost" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
export default DeleteModal;

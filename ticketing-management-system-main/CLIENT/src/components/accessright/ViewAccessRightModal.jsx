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

const ViewAccessRight = ({ isOpen, onOpenChange, details }) => {
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
                Access Right Details
              </ModalHeader>
              <ModalBody>
                {details && (
                  <>
                    <Input
                      type="text"
                      label="Name"
                      value={(details.Name || "").replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                      readOnly
                    />
                    <Input
                      type="text"
                      label="Description"
                      value={(details.Description || "").replace(
                        /\b\w/g,
                        (char) => char.toUpperCase()
                      )}
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
export default ViewAccessRight;

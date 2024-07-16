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

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-01-2024
 * PURPOSE/DESCRIPTION  : Handles the VIEW Function
 * PROGRAMMER           : John Loyd M. Ytang
 * FUNCTION NAME        : ViewDepartment
 *****************************************************************/
const ViewDepartment = ({ isOpen, onOpenChange, details }) => {
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
                Department Details
              </ModalHeader>
              <ModalBody>
                {details && (
                  <>
                    <Input
                      type="text"
                      label="Department Name"
                      value={details.Name || ""}
                      readOnly
                    />
                    <Input
                      type="text"
                      label="Description"
                      value={details.Description || ""}
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
export default ViewDepartment;

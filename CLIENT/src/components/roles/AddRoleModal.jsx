import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { SaveIcon } from "../../icons/SaveIcon.jsx";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";
import axiosInstance from "../shared/axiosInstance";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";
import { useForm } from "react-hook-form";

const AddRole = ({ isOpen, onOpenChange, onSuccess }) => {
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      data.CreatedBy = currentUserId;
      data.UpdatedBy = currentUserId;

      const response = await axiosInstance.post(`/addrecord/Role`, data);
      console.log("Role added successfully:", response.data);

      if (onSuccess) {
        onOpenChange(false);
        onSuccess();
      }
      const recordId = response.data.Id;
      await addAuditTrail(currentUserId, "AddRole", recordId, "Role");
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");

      if (error.response.data.message === "Record Already Exist") {
        setError("Name", {
          type: "manual",
          message: "Role already exists",
        });
      } else {
        console.error("Error adding Role:", error);
      }
    }
  };

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };

  // Reset errors when the modal is opened
  useEffect(() => {
    if (isOpen) {
      clearErrors();
    }
  }, [isOpen, clearErrors]);

  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };
  console.log(errors);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={true}
        isKeyboardDismissDisabled={true}
        placement="top-center"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-center">
                  Add Role
                </ModalHeader>
                <ModalBody>
                  <Input
                    type="text"
                    placeholder="Role name"
                    {...register("Name", {
                      required: "Role is required",
                      maxLength: 50,
                    })}
                    isInvalid={isInputInvalid("Name")}
                    errorMessage={errors.Name && errors.Name.message}
                    autoComplete="off"
                  />
                  <Input
                    type="text"
                    label="Description"
                    autoComplete="off"
                    {...register("Description", {
                      required: "Role Description is required",
                      maxLength: 50,
                    })}
                    errorMessage={
                      errors.Description && errors.Description.message
                    }
                    isInvalid={isInputInvalid("Description")}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="ghost" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    startContent={<SaveIcon />}
                    type="submit"
                  >
                    Save
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default AddRole;

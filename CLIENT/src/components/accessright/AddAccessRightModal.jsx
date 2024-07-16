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
import addAuditTrail from "../shared/RecordAudit.jsx";
import ToasterUtils from "../shared/ToasterUtils.jsx";
import axiosInstance from "../shared/axiosInstance";

import { useForm } from "react-hook-form";

const AddAccessRight = ({ isOpen, onOpenChange, onSuccess }) => {
  const { currentUserId } = useCurrentUser();
  const [isExist, setExist] = useState(false);
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

      const response = await axiosInstance.post(`/addrecord/AccessRight`, data);
      console.log("AccessRight added successfully:", response.data);

      if (onSuccess) {
        onOpenChange(false);
        onSuccess();
      }
      const recordId = response.data.Id;
      await addAuditTrail(
        currentUserId,
        "AddAccessRight",
        recordId,
        "AccessRight"
      );
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
      setExist(error.response.data.message);
      if (error.response.data.message === "Record Already Exist") {
        setError("Name", {
          type: "manual",
          message: "Access Right already exists",
        });
      } else {
        console.error("Error adding Data:", error);
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
                  Add Access Rights
                </ModalHeader>
                <ModalBody>
                  <Input
                    type="text"
                    placeholder="Access Right Name"
                    {...register("Name", {
                      required: "Name is required",
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
                      required: "Description is required",
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

export default AddAccessRight;

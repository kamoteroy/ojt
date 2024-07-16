import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { MailIcon } from "../../icons/MailIcon.jsx";
import { PlusIcon } from "../../icons/PlusIcon.jsx";
import { SaveIcon } from "../../icons/SaveIcon.jsx";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";
import axiosInstance from "../shared/axiosInstance";
import { useForm } from "react-hook-form";
import GetPermission from "../shared/GetPermission.jsx";
import ToasterUtils from "../shared/ToasterUtils.jsx";
import addAuditTrail from "../shared/RecordAudit";

const EditAccessRight = ({ isOpen, onOpenChange, onSuccess, id, details }) => {
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    reset,
    formState: { errors },
  } = useForm();

  //permissions
  const permissions = GetPermission() || [];
  console.log("permissions: ", permissions);
  const canEdit = permissions.includes("EditAccessRight");

  const onSubmit = async (data) => {
    try {
      data.UpdatedBy = currentUserId;

      const response = await axiosInstance.put(
        `/updaterecord/AccessRight/Id/${id}`,
        data
      );
      if (onSuccess) {
        onSuccess();
        console.log("Access Rights updated successfully:", response.data);
        onOpenChange(false); // Close the modal only on success
      }

      await addAuditTrail(currentUserId, "EditAccessRight", id, "AccessRight");
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
      if (error.response.data.message === "Record Already Exist") {
        setError("Name", {
          type: "manual",
          message: "Access Rights already exists",
        });
      } else {
        console.error("Error adding Access Rights:", error);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      clearErrors();
    }
  }, [isOpen, clearErrors]);

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };

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
                  Edit AccessRight
                </ModalHeader>
                <ModalBody>
                  {details && (
                    <>
                      <Input
                        type="text"
                        label="Access Right"
                        autoComplete="off"
                        defaultValue={details.Name || ""}
                        {...register("Name", {
                          required: "Name is required",
                          maxLength: 50,
                        })}
                        isInvalid={isInputInvalid("Name")}
                        errorMessage={errors.Name && errors.Name.message}
                        autoFocus
                      />

                      <Input
                        type="text"
                        label="Description"
                        autoComplete="off"
                        allowsCustomValue
                        defaultValue={details.Description || ""}
                        {...register("Description", {
                          required: "Product Description is required",
                          maxLength: 50,
                        })}
                        isInvalid={isInputInvalid("Description")}
                        errorMessage={
                          errors.Description && errors.Description.message
                        }
                      />
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="ghost" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    startContent={<SaveIcon />}
                    type="submit"
                    isDisabled={!canEdit}
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
export default EditAccessRight;

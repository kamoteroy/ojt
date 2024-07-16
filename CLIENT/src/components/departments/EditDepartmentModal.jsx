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
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";
import GetPermission from "../shared/GetPermission.jsx";

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-01-2024
 * PURPOSE/DESCRIPTION  : Handles the EDIT function
 * PROGRAMMER           : John Loyd M. Ytang
 * FUNCTION NAME        : EditDepartment
 *****************************************************************/
const EditDepartment = ({
  isOpen,
  onOpenChange,
  onSuccess,
  departmentId,
  details,
}) => {
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();

  const {
    register,
    reset,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm();

  //permissions
  const permissions = GetPermission() || [];
  console.log("permissions: ", permissions);
  const canEdit = permissions.includes("EditDepartment");

  console.log("Dept Id Now", departmentId);

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : When triggered, the onsubmit will edit the data inputted in edit it to the database
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : onSubmit
   *****************************************************************/
  const onSubmit = async (data) => {
    try {
      data.UpdatedBy = currentUserId;

      await axiosInstance
        .put(`/updaterecord/Department/Id/${departmentId}`, data)
        .then((res) => {
          showMessage(`${res.data.message}`, "success");
          console.log(res.data.message);
          console.log("Dept Id", departmentId);

          // If the update was successful, you can proceed
          onOpenChange(false);
          if (onSuccess) {
            onSuccess(); // Call the onSuccess callback
          }
        })
        .catch((error) => {
          showMessage(`${error.res.data.message}`, "error");

          // Check if the error response contains the message indicating that the Department name already exists
          if (
            error.response &&
            error.response.data &&
            error.response.data.message === "Record Already Exist"
          ) {
            setError("Name", {
              type: "manual",
              message: "Department Name already exists",
            });
          }
        });
      await addAuditTrail(
        currentUserId,
        "EditDepartment",
        departmentId,
        "Department"
      );
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error"); // Pass the error message
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

  useEffect(() => {
    reset();
  }, [details, reset]);

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
                  Edit Department
                </ModalHeader>
                <ModalBody>
                  {details && (
                    <>
                      <Input
                        type="text"
                        label="Department Name"
                        autoComplete="off"
                        defaultValue={details.Name || ""}
                        {...register("Name", {
                          required: "Department Name is required",
                          maxLength: 50,
                        })}
                        isInvalid={isInputInvalid("Name")}
                        errorMessage={errors.Name && errors.Name.message}
                      />

                      <Input
                        type="text"
                        label="Description"
                        autoComplete="off"
                        defaultValue={details.Description || ""}
                        {...register("Description", {
                          required: "Department Description is required",
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
export default EditDepartment;

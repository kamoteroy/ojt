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
import { SaveIcon } from "../../icons/SaveIcon.jsx";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";
import axiosInstance from "../shared/axiosInstance";
import { useForm } from "react-hook-form";
import ToasterUtils from "../shared/ToasterUtils.jsx";
import addAuditTrail from "../shared/RecordAudit.jsx";

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-01-2024
 * PURPOSE/DESCRIPTION  : Handles the ADD function
 * PROGRAMMER           : John Loyd M. Ytang
 * FUNCTION NAME        : AddDepartment
 *****************************************************************/
const AddDepartment = ({ isOpen, onOpenChange, onSuccess }) => {
  const { currentUserId } = useCurrentUser();
  const [isExist, setExist] = useState();
  const { showMessage } = ToasterUtils();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : When triggered, the onsubmit will save the data inputted in the input to the database
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : onSubmit
   *****************************************************************/
  const onSubmit = async (data) => {
    try {
      data.CreatedBy = currentUserId;
      data.UpdatedBy = currentUserId;

      const response = await axiosInstance.post(`/addrecord/Department`, data);
      if (onSuccess) {
        onOpenChange(false);
        onSuccess();
      }
      const recordId = response.data.Id;
      console.log(recordId);
      console.log(data);
      console.log(response);
      await addAuditTrail(
        currentUserId,
        "AddDepartment",
        recordId,
        "Department"
      );
      showMessage(`${response.data.message}`, "success");
      console.log("User added successfully:", response.data);
    } catch (error) {
      console.log("Message", error.response.data.message);
      showMessage(`${error.response.data.message}`, "error");
      setExist(error.response.data.message);

      if (error.response.data.message == "Record Already Exist") {
        setError("Name", {
          type: "manual",
          message: "Department Name already exist",
        });
        console.log("Errors after setting:", errors);
      } else {
        console.log("Message", error.response.data.message);
        showMessage(`${error.response.data.message}`, "error");
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
                  Add Department
                </ModalHeader>
                <ModalBody>
                  <Input
                    type="text"
                    label="Department Name"
                    autoComplete="off"
                    {...register("Name", {
                      required: "Department Name is required",
                      maxLength: 50,
                    })}
                    errorMessage={errors.Name && errors.Name.message}
                    isInvalid={isInputInvalid("Name")}
                  />
                  <Input
                    type="text"
                    label="Description"
                    autoComplete="off"
                    {...register("Description", {
                      required: "Department Description is required",
                      maxLength: 50,
                    })}
                    isInvalid={isInputInvalid("Description")}
                    errorMessage={
                      errors.Description && errors.Description.message
                    }
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

export default AddDepartment;

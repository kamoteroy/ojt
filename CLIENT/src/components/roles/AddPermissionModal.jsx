import React, { useEffect, useState, useRef } from "react";
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
  SelectItem,
  Select,
} from "@nextui-org/react";
import { SaveIcon } from "../../icons/SaveIcon.jsx";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";
import axiosInstance from "../shared/axiosInstance.jsx";
import { useForm } from "react-hook-form";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";

const AddPermission = ({ isOpen, onOpenChange, roleId, onSuccess }) => {
  console.log("roleId: ", roleId);
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const [permissions, setPermissions] = useState([]);
  const isInitialRender = useRef(true);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const fetchPermissions = async () => {
      try {
        const response = await axiosInstance.get(
          `/getRemainingAccessRights/${roleId}`
        );
        await addAuditTrail(
          currentUserId,
          "ViewRole",
          fetchPermissions,
          "Role"
        );
        console.log("response: ", response);

        const permissions = response.data
          .map((permission) => ({
            Id: permission.Id,
            name: permission.AccessRight,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        console.log("permissions: ", permissions);
        setPermissions(permissions);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [isOpen, roleId]);

  const onSubmit = async (data) => {
    console.log("data: ", data);

    try {
      if (!Array.isArray(data.AccessRightId)) {
        data.AccessRightIds = data.AccessRightId.split(",").map((id) =>
          parseInt(id.trim().replace(/^'|'$/g, ""), 10)
        );
      }
      // Convert AccessRightId to an array if it's not already in that format
      if (!Array.isArray(data.AccessRightId)) {
        data.AccessRightIds = data.AccessRightId.split(",").map((id) =>
          parseInt(id.trim().replace(/^'|'$/g, ""), 10)
        );
      }

      data.CreatedBy = currentUserId;
      data.UpdatedBy = currentUserId;
      data.RoleId = roleId;

      const response = await axiosInstance.post(`/addmultiplepermission`, data);
      if (onSuccess) {
        onOpenChange(false);
        onSuccess();
      }
      const recordId = response.data.Id;
      data.AccessRightIds.forEach(async (permissionId) => {
        await addAuditTrail(
          currentUserId,
          "AddPermission",
          permissionId,
          "Permission"
        );
      });
      showMessage(`Record Added Successfully`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");

      if (error.response.data.message === "Record Already Exist") {
        setError("AccessRight", {
          type: "manual",
          message: "Permission already exists",
        });
        console.log(error.response.data.message);
      } else {
        console.error("Error adding permission:", error);
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
                  Add Permission
                </ModalHeader>
                <ModalBody>
                  <Select
                    label="Available Permissions"
                    placeholder="Select Permission"
                    {...register("AccessRightId", {
                      required: "Permission is required",
                    })}
                    isInvalid={isInputInvalid("AccessRightId")}
                    errorMessage={
                      errors.AccessRightId && errors.AccessRightId.message
                    }
                    selectionMode="multiple"
                  >
                    {permissions.map((permission) => (
                      <SelectItem key={permission.Id} value={permission.Id}>
                        {permission.name}
                      </SelectItem>
                    ))}
                  </Select>
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

export default AddPermission;

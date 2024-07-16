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
import editAuditTrail from "../shared/RecordAudit";
import axiosInstance from "../shared/axiosInstance";
import { useForm } from "react-hook-form";
import ToasterUtils from "../shared/ToasterUtils.jsx";
import GetPermission from "../shared/GetPermission.jsx";
/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-15-2024
 * PURPOSE/DESCRIPTION  : Modal for EDIT Product
 * PROGRAMMER           : Francis A. Cejduo
 * FUNCTION NAME        : EditProduct
 *****************************************************************/
const EditProduct = ({
  isOpen,
  onOpenChange,
  onSuccess,
  productId,
  details,
}) => {
  const { currentUserId } = useCurrentUser();
  const [categories, setCategories] = useState([]);
  const [touched, setTouched] = useState(false);
  const { showMessage } = ToasterUtils();

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm();

  //permissions
  const permissions = GetPermission() || [];
  console.log("permissions: ", permissions);
  const canEdit = permissions.includes("EditProduct");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(`/getallrecord/Product`);
        const categories = response.data.map((product) => product.Category);
        setCategories([...new Set(categories)]); // Filter unique categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [isOpen]);

  const onSubmit = async (data) => {
    try {
      data.UpdatedBy = currentUserId;

      const response = await axiosInstance.put(
        `/updaterecord/Product/Id/${productId}`,
        data
      );
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }

      await editAuditTrail(currentUserId, "EditProduct", productId, "Product");
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");

      if (error.response.data.message == "Record Already Exist") {
        setError("Name", {
          type: "manual",
          message: "Product already exist",
        });
      } else {
        console.error("Error updating product:", error);
      }
    }
  };

  useEffect(() => {
    reset();
  }, [details, reset]);

  useEffect(() => {
    if (isOpen) {
      clearErrors();
    }
  }, [isOpen, clearErrors]);

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };

  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };

  const isValidNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
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
                  Edit Product
                </ModalHeader>
                <ModalBody>
                  {details && (
                    <>
                      <Input
                        type="text"
                        label="Product Name"
                        autoComplete="off"
                        defaultValue={details.Name || ""}
                        {...register("Name", {
                          required: "Product Name is required",
                          maxLength: 50,
                        })}
                        autoFocus
                        isInvalid={isInputInvalid("Name")}
                        errorMessage={errors.Name && errors.Name.message}
                      />

                      <Input
                        type="text"
                        label="Description"
                        autoComplete="off"
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

                      <Autocomplete
                        type="text"
                        label="Category"
                        allowsCustomValue
                        autoComplete="off"
                        defaultSelectedKey={details.Category || ""}
                        onKeyDown={(e) => e.continuePropagation()}
                        className="w-full"
                        {...register("Category", {
                          required: "Product Category is required",
                          maxLength: 50,
                        })}
                        isInvalid={
                          isInputInvalid("Category") || !touched ? false : true
                        }
                        errorMessage={
                          errors.Category && errors.Category.message
                        }
                      >
                        {categories.map((category) => (
                          <AutocompleteItem key={category} textValue={category}>
                            {category}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>

                      <Input
                        type="number"
                        label="Price"
                        autoComplete="off"
                        defaultValue={details.Price || ""}
                        {...register("Price", {
                          required: "Product Price is required",
                          maxLength: 50,
                          validate: {
                            float: (value) =>
                              isValidNumber(value) ||
                              "Product Price should be a valid number",
                          },
                        })}
                        isInvalid={isInputInvalid("Price")}
                        errorMessage={errors.Price && errors.Price.message}
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
export default EditProduct;

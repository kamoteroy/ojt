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
import addAuditTrail from "../shared/RecordAudit.jsx";
import ToasterUtils from "../shared/ToasterUtils.jsx";

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-01-2024
 * PURPOSE/DESCRIPTION  : Modal for Add Product
 * PROGRAMMER           : Francis A. Cejudo
 * FUNCTION NAME        : AddProduct
 *****************************************************************/
const AddProduct = ({ isOpen, onOpenChange, onSuccess }) => {
  const { currentUserId } = useCurrentUser();
  const [categories, setCategories] = useState([]);
  const { showMessage } = ToasterUtils();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(`/getallrecord/Product`);
        const categories = response.data.map((product) => product.Category);
        setCategories([...new Set(categories)]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [isOpen]);

  const onSubmit = async (data) => {
    try {
      data.CreatedBy = currentUserId;
      data.UpdatedBy = currentUserId;

      const response = await axiosInstance.post(`/addrecord/Product`, data);

      if (onSuccess) {
        onOpenChange(false);
        onSuccess();
      }
      const recordId = response.data.Id;
      await addAuditTrail(currentUserId, "AddProduct", recordId, "Product");
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");

      if (error.response.data.message == "Record Already Exist") {
        setError("Name", {
          type: "manual",
          message: "Product already exist",
        });
      } else {
        console.error("Error adding client:", error);
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
                  Add Product
                </ModalHeader>
                <ModalBody>
                  <Input
                    type="text"
                    label="Product Name"
                    autoComplete="off"
                    {...register("Name", {
                      required: "Product Name is required",
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
                    className="w-full"
                    onKeyDown={(e) => e.continuePropagation()}
                    {...register("Category", {
                      required: "Product Category is required",
                      maxLength: 50,
                    })}
                    isInvalid={isInputInvalid("Category")}
                    errorMessage={errors.Category && errors.Category.message}
                  >
                    {categories.map((category) => (
                      <AutocompleteItem key={category} value={category}>
                        {category}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  <Input
                    type="number"
                    label="Price"
                    autoComplete="off"
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

export default AddProduct;

import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Image,
  Input,
  Select,
  SelectItem,
  Tooltip,
  Checkbox,
} from "@nextui-org/react";
import {
  SelectTicketSeverity,
  SelectTicketCategory,
} from "../../data/SelectData";
import { CameraIcon } from "../../icons/CameraIcon";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import { useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import axiosInstance from "../shared/axiosInstance";
import { columns, statusOptions } from "../../data/TicketsData";
import AddTicketLine from "./AddTicketLine";

const AddTicket = () => {
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [products, setProducts] = useState([]);
  const [value, setValue] = useState(false);
  const { currentUserId } = useCurrentUser();
  const [isExist, setExist] = useState();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (data.Middlename === "") {
      delete data.Middlename;
    }
    console.log(data);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      ["AnsweredBy", "CreatedBy", "UpdatedBy"].forEach((prop) => {
        data[prop] = currentUserId;
      });
      data.DoneDate = new Date();
      data.IsReviewed = 1;
      const response = await axiosInstance.post(`/addrecord/Ticket`, data);
      if (imageFile) {
        const uploadResponse = await axios.post(
          `${BASE_URL}/uploadImage/User/Image/${data.Username}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Image uploaded successfully:", uploadResponse.data);
        console.log("User added successfully:", response.data);
      }
    } catch (error) {
      console.log("Message", error.response.data.message);
      setExist(error.response.data.error);

      if (error.response.data.message == "Record Already Exist") {
        setError("Username", {
          type: "manual",
          message: "Username already exist",
        });
      } else {
        console.error("Error adding user:", error);
      }
    }
    handleGoBack();
  };
  console.log(errors);

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchName = async () => {
      try {
        const userResponse = await axiosInstance.get(`/getallrecord/User`);
        setUsers(userResponse.data);

        const clientResponse = await axiosInstance.get(`/getallrecord/Client`);

        //check if response has data
        if (clientResponse.data.length > 0) {
          console.log("Product", clientResponse);
          setClients(clientResponse.data);
        }

        const productResponse = await axiosInstance.get(
          `/getallrecord/Product`
        );
        console.log("Product", productResponse);
        setProducts(productResponse.data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    fetchName();

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };
  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };
  const handleImageUpload = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };
  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">
        Add Ticket
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        Ticket Information
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* {isExist && <div className="text-red-500">{isExist}</div>} */}
        {/* Primary Information */}
        <div className="flex flex-col md:flex-row gap-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-3">
            <Input
              type="text"
              placeholder="Caller"
              {...register("Caller", {
                required: "Caller is required",
                maxLength: 50,
                validate: {
                  onlyLetters: (value) =>
                    isOnlyLetters(value) ||
                    "Caller should contain only letters",
                },
              })}
              isInvalid={isInputInvalid("Caller")}
              errorMessage={errors.Caller && errors.Caller.message}
              autoComplete="off"
            />

            <Input
              type="text"
              placeholder="Concern"
              {...register("Concern", {
                required: "Concern is required",
                maxLength: 50,
                validate: {
                  onlyLetters: (value) =>
                    isOnlyLetters(value) ||
                    "Concern should contain only letters",
                },
              })}
              isInvalid={isInputInvalid("Concern")}
              errorMessage={errors.Concern && errors.Concern.message}
              autoComplete="off"
            />

            <Input
              type="text"
              placeholder="Remarks"
              {...register("Remarks", {
                validate: {
                  onlyLetters: (value) =>
                    isOnlyLetters(value) ||
                    "Remarks should contain only letters",
                },
              })}
              isInvalid={isInputInvalid("Remarks")}
              errorMessage={errors.Remarks && errors.Remarks.message}
              autoComplete="off"
            />

            <Select
              label="Category"
              placeholder="Select Category"
              {...register("Category", {
                required: "Category is required",
              })}
              isInvalid={isInputInvalid("Category")}
              errorMessage={errors.Category && errors.Category.message}
            >
              {SelectTicketCategory.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Severity"
              placeholder="Select Severity"
              {...register("Severity", {
                required: "Severity is required",
              })}
              isInvalid={isInputInvalid("Severity")}
              errorMessage={errors.Severity && errors.Severity.message}
            >
              {SelectTicketSeverity.map((severity) => (
                <SelectItem key={severity.value} value={severity.value}>
                  {severity.label}
                </SelectItem>
              ))}
            </Select>

            <Input
              type="text"
              placeholder="Solution"
              {...register("Solution", {
                required: "Solution is required",
              })}
              isInvalid={isInputInvalid("Solution")}
              errorMessage={errors.Solution && errors.Solution.message}
            />
            {/* 
            <Checkbox isSelected={value} onValueChange={setValue}>
              IsReviewed
            </Checkbox> */}

            <div className="relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100 min-h-unit-10 rounded-medium flex-row items-center justify-start gap-0 transition-background motion-reduce:transition-none !duration-150 outline-none group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background h-14 py-2">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                name="image"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ zIndex: 1 }}
              />
              <label
                htmlFor="file-upload"
                className="absolute inset-0 flex items-center justify-start cursor-pointer pl-3"
              >
                <CameraIcon className="h-5 w-5" />
              </label>
              <div className="absolute inset-0 flex items-center justify-start cursor-pointer overflow-hidden pl-10 pr-3">
                <div className="whitespace-nowrap overflow-ellipsis overflow-hidden text-sm">
                  {fileName ? fileName : "Upload Image"}
                </div>
              </div>
            </div>

            <Select
              label="Assigned To"
              placeholder="Assign To"
              {...register("AssignedBy", {
                required: "AssignedBy is required",
              })}
              isInvalid={isInputInvalid("AssignedBy")}
              errorMessage={errors.AssignedBy && errors.AssignedBy.message}
            >
              {users.map((user) => (
                <SelectItem key={user.Id} value={user.Id}>
                  {`${user.Firstname} ${user.Lastname}`}
                </SelectItem>
              ))}
            </Select>

            {/* <Select
              label="Status"
              placeholder="Status"
              {...register("Status", {
                required: "Status is required",
              })}
              isInvalid={isInputInvalid("Status")}
              errorMessage={errors.Status && errors.Status.message}
            >
              {statusOptions.map((status) => (
                <SelectItem
                  key={parseInt(status.value)}
                  value={parseInt(status.value)}
                >
                  {status.name}
                </SelectItem>
              ))}
            </Select> */}
          </div>
        </div>
        {/* Select Product and Client */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 pt-10">
          <Select
            label="Product"
            placeholder="Select Product"
            {...register("ProductId", {
              required: "Product is required",
            })}
            isInvalid={isInputInvalid("ProductId")}
            errorMessage={errors.ProductId && errors.ProductId.message}
          >
            {products.map((product) => (
              <SelectItem key={product.Id} value={product.Id}>
                {product.Name}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Client"
            placeholder="Select Client"
            {...register("ClientId", {
              required: "Client is required",
            })}
            isInvalid={isInputInvalid("ClientId")}
            errorMessage={errors.ClientId && errors.ClientId.message}
          >
            {clients.map((client) => (
              <SelectItem key={client.Id} value={client.Id}>
                {client.Name}
              </SelectItem>
            ))}
          </Select>
        </div>
        <AddTicketLine />
        {/* Submit Button */}
        <div className="pt-10 justify-end flex gap-4">
          <Button color="primary" variant="ghost" onClick={handleGoBack}>
            Back
          </Button>
          <Button color="primary" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTicket;

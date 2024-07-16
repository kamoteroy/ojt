import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Image,
  Input,
  Select,
  SelectItem,
  Tooltip,
} from "@nextui-org/react";
import { SelectGender } from "../../data/SelectData";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axiosInstance from "../shared/axiosInstance";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";

const AddUser = () => {
  const { showMessage } = ToasterUtils();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const { currentUserId } = useCurrentUser();
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
      data.isDeactivated = 0;
      data.CreatedBy = currentUserId;
      const response = await axiosInstance.post(`/createuser/User`, data);

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
      }
      const recordId = response.data.Id;
      await addAuditTrail(currentUserId, "AddUser", recordId, "User");
      showMessage(`${response.data.message}`, "success");
      navigate("/users");
      // Scroll to the top of the page
      window.scrollTo(0, 0);
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");

      if (error.response.data.message == "Record Already Exist") {
        setError("Username", {
          type: "manual",
          message: "Username already exist",
        });
      } else {
        console.error("Error adding user:", error);
      }
    }
  };
  console.log(errors);

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchName = async () => {
      try {
        const response = await axiosInstance.get("/getroledept");
        const { data } = response;
        const roleData = data.filter((item) => item.source === "Role");
        const departmentData = data.filter(
          (item) => item.source === "Department"
        );
        setRoles(roleData);
        setDepartments(departmentData);
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

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // This is required for Chrome
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [imageFile]);

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };
  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };

  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">Add User</div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        Primary Information
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Primary Information */}
        <div className="flex flex-col md:flex-row gap-16">
          <Tooltip content="Add Image" color="warning" className="text-white">
            <div className="relative flex flex-col gap-2 items-center justify-center">
              <div className="relative inline-block rounded-full overflow-hidden w-[200px] h-[200px]">
                <img
                  alt="NextUI hero Image"
                  src={
                    imagePreview ||
                    "https://i.pravatar.cc/150?u=a04258114e29026708c"
                  }
                  className="object-cover w-full h-full"
                />
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ zIndex: 1 }}
                />
              </div>
            </div>
          </Tooltip>
          <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-3">
            <Input
              type="text"
              label="First Name"
              {...register("Firstname", {
                required: "Firstname is required",
                maxLength: 50,
                validate: {
                  onlyLetters: (value) =>
                    isOnlyLetters(value) ||
                    "First name should contain only letters",
                },
              })}
              isInvalid={isInputInvalid("Firstname")}
              errorMessage={errors.Firstname && errors.Firstname.message}
              autoComplete="off"
            />

            <Input
              type="text"
              label="Middle Name"
              {...register("Middlename", {
                validate: {
                  onlyLetters: (value) =>
                    isOnlyLetters(value) ||
                    "Middle name should contain only letters",
                },
              })}
              isInvalid={isInputInvalid("Middlename")}
              errorMessage={errors.Middlename && errors.Middlename.message}
              autoComplete="off"
            />
            <Input
              type="text"
              label="Last Name"
              {...register("Lastname", {
                required: "Lastname is required",
                maxLength: 50,
                validate: {
                  onlyLetters: (value) =>
                    isOnlyLetters(value) ||
                    "Last name should contain only letters",
                },
              })}
              isInvalid={isInputInvalid("Lastname")}
              errorMessage={errors.Lastname && errors.Lastname.message}
              autoComplete="off"
            />

            <Input
              type="text"
              label="Username"
              {...register("Username", {
                required: "Username is required",
                maxLength: 50,
              })}
              isInvalid={isInputInvalid("Username")}
              errorMessage={errors.Username && errors.Username.message}
              autoComplete="off"
            />
          </div>
        </div>
        {/* Additional Information */}
        <div className="flex-row pt-10 pb-3 uppercase font-bold">
          Additional Information
        </div>
        {/* Select Status and Role */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2">
          <Input
            type="date"
            label="Birthdate"
            placeholder="Birthdate"
            {...register("Birthdate", {
              required: "Birthdate is required",
            })}
            isInvalid={isInputInvalid("Birthdate")}
            errorMessage={errors.Birthdate && errors.Birthdate.message}
            autoComplete="off"
          />

          <Input
            type="text"
            label="Address"
            {...register("Address", {
              required: "Address is required",
            })}
            isInvalid={isInputInvalid("Address")}
            errorMessage={errors.Address && errors.Address.message}
            autoComplete="off"
          />

          <Input
            type="number"
            label="Contact Number"
            {...register("ContactNumber", {
              required: "Contact Number is required",
              pattern: {
                value: /^09\d{9}$/,
                message: "Invalid Contact Number",
              },
            })}
            isInvalid={isInputInvalid("ContactNumber")}
            errorMessage={errors.ContactNumber && errors.ContactNumber.message}
            autoComplete="off"
            min={1}
          />
          <Select
            label="Role"
            placeholder="Select Role"
            {...register("RoleId", {
              required: "Role is required",
            })}
            isInvalid={isInputInvalid("RoleId")}
            errorMessage={errors.RoleId && errors.RoleId.message}
          >
            {roles.map((role) => (
              <SelectItem key={role.Id} value={role.Id}>
                {role.Name}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Department"
            placeholder="Select Department"
            {...register("DepartmentId", {
              required: "Repartment is required",
            })}
            isInvalid={isInputInvalid("DepartmentId")}
            errorMessage={errors.DepartmentId && errors.DepartmentId.message}
          >
            {departments.map((department) => (
              <SelectItem key={department.Id} value={department.Id}>
                {department.Name}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Gender"
            placeholder="Select Gender"
            {...register("Gender", {
              required: "Gender is required",
            })}
            isInvalid={isInputInvalid("Gender")}
            errorMessage={errors.Gender && errors.Gender.message}
            autoComplete="off"
          >
            {SelectGender.map((gender) => (
              <SelectItem key={gender.value} value={gender.value}>
                {gender.label}
              </SelectItem>
            ))}
          </Select>
        </div>
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

export default AddUser;

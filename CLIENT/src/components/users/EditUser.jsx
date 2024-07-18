import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Input,
  Select,
  SelectItem,
  Tooltip,
  Skeleton,
} from "@nextui-org/react";
import { EyeFilledIcon } from "../../icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../../icons/EyeSlashFilledIcon";
import { BASE_URL } from "../../routes/BaseUrl";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import ModalApp from "../shared/Modal";
import axiosInstance from "../shared/axiosInstance";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import axios from "axios";
import { SelectGender, SelectStatus } from "../../data/SelectData";
import ToasterUtils from "../shared/ToasterUtils";
import addAuditTrail from "../shared/RecordAudit";
import { EditIcon } from "../../icons/EditIcon";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../routes/breadcrumb";

const EditUser = () => {
  const { userId } = useParams();
  const { showMessage } = ToasterUtils();
  const [isVisible, setIsVisible] = useState(false);
  const [details, setDetails] = useState({});
  const { currentUserId } = useCurrentUser();
  const [password, setPassword] = useState("");
  const [editedDetails, setEditedDetails] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const handleGoBack = () => {
    navigate(-1);
  };

  const user = useSelector((state) => state.user.value);

  //permissions
  const permissions = user.permissions;
  const canEditUser = permissions.includes("EditUser");
  const [isEditable, setIsEditable] = useState(false);

  const handleEditToggle = () => {
    setIsEditable(!isEditable);
  };

  const resetPass = async () => {
    try {
      const response = await axiosInstance.get(`/generatepass`);
      setPassword(response.data.password);
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };
  useEffect(() => {
    const decryptPass = async () => {
      const response = await axiosInstance.get(`/decrypt/${userId}`);
      setPassword(response.data.decryptedPassword);
    };
    decryptPass();
  }, []);

  const onSubmit = async (data) => {
    console.log("Account Status", data.isDeactivated);

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      data.CreatedBy = currentUserId;
      data.RoleId = editedDetails.RoleId || details.RoleId;
      data.DepartmentId = editedDetails.DepartmentId || details.DepartmentId;
      data.Password = password;
      if (data.Gender) {
        if (data.Gender === details.Gender) {
          delete data.Gender;
        }
      } else {
        delete data.Gender;
      }

      if (
        data.isDeactivated !== "" &&
        data.isDeactivated !== details.isDeactivated
      ) {
        data.isDeactivated = parseInt(data.isDeactivated);
      } else {
        delete data.isDeactivated;
      }

      const response = await axiosInstance.put(
        `/updaterecord/User/Id/${userId}`,
        data
      );
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
      console.log("data", data);
      setIsModalOpen(false);
      await addAuditTrail(currentUserId, "EditUser", userId, "User");
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
        console.error("Error updating user:", error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/getuserroledept/User/${userId}`
        );
        const formattedDetails = { ...response.data };

        formattedDetails.Birthdate = formattedDetails.Birthdate
          ? formattedDetails.Birthdate.split("T")[0]
          : "";
        setDetails(formattedDetails);
        setImageUrl(`${BASE_URL}/images/${response.data.Image}`);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchData();
    console.log("details", details);
  }, [userId]);

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
  }, [imageFile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };
  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };

  return (
    <>
      <Breadcrumbs />
      <div className="bg-white min-h-fit py-10 px-8">
        <div className="flex flex-row text-2xl font-bold uppercase">
          Edit User
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            color="secondary"
            className={`text-lg text-default-400 cursor-pointer active:opacity-50`}
            onClick={handleEditToggle}
          >
            <EditIcon />
          </Button>
        </div>
        <Divider />
        <div className="flex-row py-3 uppercase font-bold pb-14">
          Primary Information
        </div>
        {/* Primary Information */}
        {Object.keys(details).length > 0 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col md:flex-row gap-16">
              <Tooltip
                content="Edit Image"
                color="warning"
                className="text-white"
              >
                <div className="relative flex flex-col gap-2 items-center justify-center">
                  <Skeleton isLoaded={!showSkeleton} className="rounded-full">
                    <div className="relative inline-block rounded-full overflow-hidden w-[200px] h-[200px]">
                      <img
                        alt="Error"
                        src={imagePreview || imageUrl}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.src =
                            "https://i.pravatar.cc/150?u=a04258114e29026708c";
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!isEditable}
                        name="image"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        style={{ zIndex: 1 }}
                      />
                    </div>
                  </Skeleton>
                </div>
              </Tooltip>
              <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-3">
                <Input
                  type="text"
                  label="First Name"
                  autoComplete="off"
                  disabled={!isEditable}
                  name="Firstname"
                  defaultValue={details.Firstname || ""}
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
                />
                <Input
                  type="text"
                  label="Middle Name"
                  disabled={!isEditable}
                  autoComplete="off"
                  name="Middlename"
                  defaultValue={details.Middlename || ""}
                  {...register("Middlename", {
                    validate: {
                      onlyLetters: (value) =>
                        isOnlyLetters(value) ||
                        "Middle name should contain only letters",
                    },
                  })}
                  isInvalid={isInputInvalid("Middlename")}
                  errorMessage={errors.Middlename && errors.Middlename.message}
                />
                <Input
                  type="text"
                  label="Last Name"
                  disabled={!isEditable}
                  autoComplete="off"
                  name="Lastname"
                  defaultValue={details.Lastname || ""}
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
                />

                <Input
                  type="text"
                  label="Username"
                  disabled={!isEditable}
                  autoComplete="off"
                  name="Username"
                  defaultValue={details.Username || ""}
                  {...register("Username", {
                    required: "Username is required",
                    maxLength: 50,
                  })}
                  isInvalid={isInputInvalid("Username")}
                  errorMessage={errors.Username && errors.Username.message}
                />
                <Select
                  label="Status"
                  placeholder={
                    details.isDeactivated === 0
                      ? "Active"
                      : "Disabled" || "Select Status"
                  }
                  defaultValue={details.isDeactivated || ""}
                  {...register("isDeactivated")}
                  isInvalid={isInputInvalid("isDeactivated")}
                  errorMessage={
                    errors.isDeactivated && errors.isDeactivated.message
                  }
                  autoComplete="off"
                >
                  {SelectStatus.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                      isDisabled={!isEditable}
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </Select>
                <div className="flex flex-row gap-2">
                  <Input
                    name="Password"
                    label="Password"
                    disabled={!isEditable}
                    size="md"
                    placeholder={password}
                    value={password}
                    type={isVisible ? "text" : "password"}
                    {...register("Password", {
                      onChange: (e) => setPassword(e.target.value),
                      pattern: {
                        value: passwordRegex,
                        message:
                          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
                      },
                    })}
                    autoComplete="off"
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleVisibility}
                      >
                        {isVisible ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    isInvalid={isInputInvalid("Password")}
                    errorMessage={errors.Password && errors.Password.message}
                  />

                  <Button
                    color="primary"
                    onClick={resetPass}
                    size="md"
                    className="py-7"
                    isDisabled={!isEditable}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            {/* Additional Information */}
            <div className="flex-row pt-10 pb-3 uppercase font-bold">
              Additional Information
            </div>
            <div className="flex flex-col md:flex-row gap-4 ">
              <Input
                type="number"
                label="Contact Number"
                autoComplete="off"
                disabled={!isEditable}
                name="ContactNumber"
                defaultValue={details.ContactNumber || ""}
                {...register("ContactNumber", {
                  required: "Contact Number is required",
                  pattern: {
                    value: /^09\d{9}$/,
                    message: "Invalid Contact Number (e.g 09xxxxxxxxx)",
                  },
                })}
                isInvalid={isInputInvalid("ContactNumber")}
                errorMessage={
                  errors.ContactNumber && errors.ContactNumber.message
                }
              />

              <Input
                type="text"
                label="Address"
                autoComplete="off"
                disabled={!isEditable}
                name="Address"
                defaultValue={details.Address || ""}
                {...register("Address", {
                  required: "Address is required",
                  maxLength: 50,
                })}
                isInvalid={isInputInvalid("Address")}
                errorMessage={errors.Address && errors.Address.message}
              />

              <Input
                type="date"
                label="Birthdate"
                autoComplete="off"
                disabled={!isEditable}
                name="Birthdate"
                defaultValue={details.Birthdate || ""}
                {...register("Birthdate", {
                  pattern: {
                    value:
                      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$|^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                    message: "Invalid date format (dd/mm/yyyy)",
                  },
                })}
                isInvalid={isInputInvalid("Birthdate")}
                errorMessage={errors.Birthdate && errors.Birthdate.message}
              />
            </div>
            {/* Select Role, Department, Gender */}

            <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 pt-10">
              <Select
                label="Gender"
                placeholder={details.Gender || "Select Gender"}
                defaultValue={details.Gender || ""}
                {...register("Gender")}
                isInvalid={isInputInvalid("Gender")}
                errorMessage={errors.Gender && errors.Gender.message}
                autoComplete="off"
              >
                {SelectGender.map((gender) => (
                  <SelectItem
                    key={gender.value}
                    value={gender.value}
                    isDisabled={!isEditable}
                  >
                    {gender.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Role"
                placeholder={details.RoleName || "Select Role"}
                defaultValue={!editedDetails.RoleId ? details.RoleId || "" : ""}
                {...register("RoleId")}
                onChange={(e) => {
                  setEditedDetails((prevDetails) => ({
                    ...prevDetails,
                    RoleId: e.target.value,
                  }));
                }}
              >
                {roles &&
                  roles.map((role) => (
                    <SelectItem
                      key={role.Id}
                      value={role.Id}
                      isDisabled={!isEditable}
                    >
                      {role.Name}
                    </SelectItem>
                  ))}
              </Select>
              <Select
                label="Department"
                placeholder={details.DepartmentName || "Select Department"}
                defaultValue={
                  !editedDetails.DepartmentId ? details.DepartmentId || "" : ""
                }
                {...register("DepartmentId")}
                onChange={(e) => {
                  setEditedDetails((prevDetails) => ({
                    ...prevDetails,
                    DepartmentId: e.target.value,
                  }));
                }}
              >
                {departments &&
                  departments.map((department) => (
                    <SelectItem
                      key={department.Id}
                      value={department.Id}
                      isDisabled={!isEditable}
                    >
                      {department.Name}
                    </SelectItem>
                  ))}
              </Select>
            </div>
            {/* Submit Button */}
            <div className="pt-10 justify-end flex gap-4">
              <Button color="primary" variant="ghost" onClick={handleGoBack}>
                Back
              </Button>
              <Button
                color="primary"
                onClick={() => setIsModalOpen(true)}
                isDisabled={!canEditUser || !isEditable}
              >
                Save Changes
              </Button>
              <ModalApp
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit User"
                content="Proceed to Save Changes?"
                actionButtonLabel="Confirm"
                actionButtonOnClick={() => handleSubmit(onSubmit)()}
              />
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default EditUser;

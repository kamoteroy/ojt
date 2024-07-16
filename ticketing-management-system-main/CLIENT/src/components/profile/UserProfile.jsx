import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Image,
  Input,
  Skeleton,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { BASE_URL } from "../../routes/BaseUrl";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../shared/axiosInstance";
import { useForm } from "react-hook-form";
import ModalApp from "../shared/Modal";
import { SettingsIcon } from "../../icons/SettingsIcon.jsx";
import { DocumentIcon } from "../../icons/DocumentIcon.jsx";
import { EyeSlashFilledIcon } from "../../icons/EyeSlashFilledIcon.jsx";
import { EyeFilledIcon } from "../../icons/EyeFilledIcon.jsx";
import ToasterUtils from "../shared/ToasterUtils";
import addAuditTrail from "../shared/RecordAudit";

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-23-2024
 * PURPOSE/DESCRIPTION  : Handles User Profile
 * PROGRAMMER           : Francis A. Cejudo
 * FUNCTION NAME        : UserProfile
 *****************************************************************/
const UserProfile = () => {
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const [details, setDetails] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisibleCurrent, setIsVisibleCurrent] = useState(false);
  const [isVisibleNew, setIsVisibleNew] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  const [showSkeleton, setShowSkeleton] = useState(true);

  const handleGoBack = () => {
    navigate(-1);
  };
  const toggleVisibilityCurrent = () => setIsVisibleCurrent(!isVisibleCurrent);
  const toggleVisibilityNew = () => setIsVisibleNew(!isVisibleNew);
  const toggleVisibilityConfirm = () => setIsVisibleConfirm(!isVisibleConfirm);
  const [passwordStrength, setPasswordStrength] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/getuserroledept/User/${currentUserId}`
        );
        setDetails(response.data);
        setImageUrl(`${BASE_URL}/images/${response.data.Image}`);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const decryptPass = async () => {
      const response = await axiosInstance.get(`/decrypt/${currentUserId}`);
      setPassword(response.data.decryptedPassword);
    };
    decryptPass();
  }, [newPassword]);

  const birthdate = details?.Birthdate?.split("T")[0] || "";
  const updatedDetails = {
    ...details,
    Birthdate: birthdate,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data) => {
    try {
      data.UpdatedBy = currentUserId;

      if (enteredPassword === password) {
        setIsPasswordCorrect(true);
        if (newPassword === confirmPassword) {
          const response = await axiosInstance.put(
            `/updatepassword/User/Id/${currentUserId}`,
            data
          );
          setPassword(newPassword);
          await addAuditTrail(
            currentUserId,
            "UpdatePassword",
            currentUserId,
            "User"
          );
          showMessage(`${response.data.message}`, "success");

          setEnteredPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setIsModalOpen(false);
        } else {
          console.log("New password and confirm password do not match.");
        }
      } else {
        setIsPasswordCorrect(false);
      }
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
    }
  };

  const checkPasswordStrength = (password) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    return regex.test(password);
  };

  const handlePasswordChange = (e) => {
    const enteredPassword = e.target.value;
    setEnteredPassword(enteredPassword);
    if (enteredPassword === password) {
      setIsPasswordCorrect(true);
    } else {
      setIsPasswordCorrect(false);
    }
    // Reset the target value
  };

  const handleNewPasswordChange = (e) => {
    const newPwd = e.target.value;
    setNewPassword(newPwd);

    const isStrong = checkPasswordStrength(newPwd);
    setPasswordStrength(isStrong ? "Strong" : "Weak");

    if (confirmPassword) {
      setIsPasswordMatch(newPwd === confirmPassword);
    } else {
      setIsPasswordMatch(false);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (newPassword && e.target.value) {
      setIsPasswordMatch(e.target.value === newPassword);
    } else {
      setIsPasswordMatch(false);
    }
  };

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };
  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };
  return (
    <div className="bg-white min-h-fit py-10 md:px-8">
      <div className="flex flex-row text-2xl font-bold uppercase px-8">
        {/* {`${details.Lastname || ""} Details`} */}
        User Profile
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14 px-8">
        Profile Information
      </div>
      {/* Primary Information */}
      <div className="gap-2 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 px-8">
        <Card className="min-width-full h-[500px]">
          <div className="flex flex-col gap-3 justify-center">
            <CardHeader className=" justify-center">
              <Skeleton
                isLoaded={!showSkeleton}
                className="rounded-full h-[225px] w-[225px]"
              >
                <img
                  alt="Error"
                  src={
                    imageUrl
                      ? imageUrl
                      : "https://i.pravatar.cc/150?u=a04258114e29026708c"
                  }
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.src =
                      "https://i.pravatar.cc/150?u=a04258114e29026708c";
                  }}
                />
              </Skeleton>
            </CardHeader>

            <CardBody className="flex flex-col gap-4 px-10 py-0 text-small text-default-400">
              <Input
                type="text"
                label="Username"
                value={details.Username || ""}
                variant="underlined"
                disabled
              />
              <Input
                type="text"
                label="Full Name"
                value={`${details.Firstname || ""} ${
                  details.Middlename || ""
                } ${details.Lastname || ""}`}
                variant="underlined"
                disabled
              />

              <Input
                type="text"
                label="Role"
                value={details.RoleName || ""}
                variant="underlined"
                disabled
              />
            </CardBody>
          </div>
        </Card>

        <div className="flex w-full flex-col">
          <Card className="min-width-full h-[500px]">
            <CardBody>
              <Tabs
                aria-label="Options"
                color="primary"
                variant="bordered"
                fullWidth
              >
                <Tab
                  key="information"
                  title={
                    <div className="flex items-center space-x-2">
                      <DocumentIcon />
                      <span>Additional Info</span>
                    </div>
                  }
                >
                  <h4 className="text-black font-medium text-large">
                    User Information
                  </h4>
                  <div className="flex flex-col gap-4">
                    <Input
                      type="text"
                      label="Gender"
                      value={details.Gender || ""}
                      readOnly
                    />
                    <Input
                      type="text"
                      label="Contact #"
                      value={details.ContactNumber || ""}
                      readOnly
                    />
                    <Input
                      type="text"
                      label="Address"
                      value={details.Address || ""}
                      readOnly
                    />
                    <Input
                      type="date"
                      label="Date of Birth"
                      value={updatedDetails.Birthdate || ""}
                      readOnly
                    />
                  </div>
                </Tab>
                <Tab
                  key="settings"
                  title={
                    <div className="flex items-center space-x-2">
                      <SettingsIcon />
                      <span>Password</span>
                    </div>
                  }
                >
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <h4 className="text-black font-medium text-large">
                      Current Password
                    </h4>

                    <div className="flex flex-col  gap-4">
                      <Input
                        type={isVisibleCurrent ? "text" : "password"}
                        label="Current Password"
                        placeholder="Enter current password"
                        endContent={
                          <button
                            className="focus:outline-none"
                            type="button"
                            onClick={toggleVisibilityCurrent}
                          >
                            {isVisibleCurrent ? (
                              <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                              <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            )}
                          </button>
                        }
                        value={enteredPassword}
                        onChange={handlePasswordChange}
                        isInvalid={enteredPassword && !isPasswordCorrect}
                        errorMessage={
                          enteredPassword &&
                          !isPasswordCorrect &&
                          "Incorrect password."
                        }
                      />

                      <h4 className="text-black font-medium text-large">
                        Change Password
                      </h4>
                      <Input
                        type={isVisibleNew ? "text" : "password"}
                        label="New Password"
                        placeholder="Enter New Password"
                        endContent={
                          <button
                            className="focus:outline-none"
                            type="button"
                            onClick={toggleVisibilityNew}
                          >
                            {isVisibleNew ? (
                              <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                              <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            )}
                          </button>
                        }
                        {...register("Password", {})}
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        isInvalid={
                          newPassword &&
                          confirmPassword &&
                          (!isPasswordMatch || passwordStrength === "Weak")
                        }
                        errorMessage={
                          newPassword &&
                          confirmPassword &&
                          (!isPasswordMatch || passwordStrength === "Weak")
                            ? passwordStrength === "Weak"
                              ? "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number." // Display this message if password is not strong enough
                              : "Passwords do not match"
                            : undefined
                        }
                        autoComplete="off"
                      />

                      <Input
                        type={isVisibleNew ? "text" : "password"}
                        label="Confirm Password"
                        placeholder="Re-type New Password"
                        endContent={
                          <button
                            className="focus:outline-none"
                            type="button"
                            onClick={toggleVisibilityNew}
                          >
                            {isVisibleNew ? (
                              <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                              <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                            )}
                          </button>
                        }
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        isInvalid={
                          newPassword && confirmPassword && !isPasswordMatch
                        }
                        errorMessage={
                          newPassword && confirmPassword && !isPasswordMatch
                            ? "Passwords do not match"
                            : undefined
                        }
                      />

                      <Button
                        color="primary"
                        variant="solid"
                        onClick={() => setIsModalOpen(true)}
                        isDisabled={
                          !isPasswordCorrect ||
                          !isPasswordMatch ||
                          passwordStrength === "Weak"
                        }
                      >
                        Change Password
                      </Button>
                      <ModalApp
                        isOpen={isModalOpen}
                        onOpenChange={setIsModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Change Password"
                        content="Proceed to Save Changes?"
                        actionButtonLabel="Confirm"
                        actionButtonOnClick={handleSubmit(onSubmit)}
                      />
                    </div>
                  </form>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="pt-10 justify-end flex gap-4">
        <Button color="primary" variant="ghost" onClick={handleGoBack}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;

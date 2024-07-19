import React, { useEffect, useState } from "react";
import { Button, Divider, Input } from "@nextui-org/react";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import ModalApp from "../shared/Modal";
import editAuditTrail from "../shared/RecordAudit";
import axiosInstance from "../shared/axiosInstance";
import ToasterUtils from "../shared/ToasterUtils";
import GetPermission from "../shared/GetPermission.jsx";
import { EditIcon } from "../../icons/EditIcon";

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-22-2024
 * PURPOSE/DESCRIPTION  : Handles EDIT function of client
 * PROGRAMMER           : Francis A. Cejudo
 * FUNCTION NAME        : EditClient
 *****************************************************************/
const EditClient = () => {
  const { clientId } = useParams();
  const { showMessage } = ToasterUtils();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [details, setDetails] = useState({});
  const { currentUserId } = useCurrentUser();

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm();

  //permissions
  const permissions = GetPermission() || [];
  console.log("permissions: ", permissions);
  const canEdit = permissions.includes("EditRole");
  const [isEditable, setIsEditable] = useState(false);

  const handleEditToggle = () => {
    setIsEditable(!isEditable);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/getrecord/Client/Id/${clientId}`
        );
        const formattedDetails = { ...response.data };

        formattedDetails.DateSoftwareAcceptance =
          formattedDetails.DateSoftwareAcceptance
            ? formattedDetails.DateSoftwareAcceptance.split("T")[0]
            : "";
        formattedDetails.DateBCSExpiry = formattedDetails.DateBCSExpiry
          ? formattedDetails.DateBCSExpiry.split("T")[0]
          : "";
        formattedDetails.DateBCSRenewal = formattedDetails.DateBCSRenewal
          ? formattedDetails.DateBCSRenewal.split("T")[0]
          : "";

        setDetails(formattedDetails);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchData();
  }, [clientId]);

  const onSubmit = async (data) => {
    try {
      data.CreatedBy = currentUserId;
      const response = await axiosInstance.put(
        `/updaterecord/Client/Id/${clientId}`,
        data
      );
      setIsModalOpen(false);
      await editAuditTrail(currentUserId, "EditClient", clientId, "Client");
      showMessage(`${response.data.message}`, "success");
      navigate("/clients");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");

      if (error.response.data.message == "Record Already Exist") {
        setError("Name", {
          type: "manual",
          message: "Name already exist",
        });
      } else {
        console.error("Error updating client:", error);
      }
    }
  };

  const calculateColor = (DateSoftwareAcceptance, DateBCSExpiry) => {
    const today = new Date();
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    const utc1 = Date.UTC(
      DateSoftwareAcceptance.getFullYear(),
      DateSoftwareAcceptance.getMonth(),
      DateSoftwareAcceptance.getDate()
    );
    const utc2 = Date.UTC(
      DateBCSExpiry.getFullYear(),
      DateBCSExpiry.getMonth(),
      DateBCSExpiry.getDate()
    );
    const diff = Math.floor((utc2 - utc1) / _MS_PER_DAY);

    if (diff > 30) {
      return "success"; // More than 1 month, green
    } else if (diff >= 0 && diff <= 30) {
      return "warning"; // 1 month or less, yellow
    } else {
      return "danger"; // Exceeds expiry, red
    }
  };

  const color = calculateColor(
    new Date(details.DateSoftwareAcceptance),
    new Date(details.DateBCSExpiry)
  );

  const handleGoBack = () => {
    navigate("/clients");
  };

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };
  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };

  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">
        Edit Client
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="secondary"
          className={`text-lg text-default-400 cursor-pointer active:opacity-50 ml-auto`}
          onClick={handleEditToggle}
          isDisabled={!canEdit}
        >
          <EditIcon />
        </Button>
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        Client Information
      </div>
      {Object.keys(details).length > 0 && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row gap-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-3">
              <Input
                type="text"
                label="Client Name"
                disabled={!isEditable}
                autoComplete="off"
                name="Name"
                defaultValue={details.Name || ""}
                {...register("Name", {
                  required: "Client Name is required",
                  maxLength: 50,
                })}
                isInvalid={isInputInvalid("Name")}
                errorMessage={errors.Name && errors.Name.message}
              />
              <Input
                type="text"
                label="Address"
                disabled={!isEditable}
                autoComplete="off"
                name="Address"
                defaultValue={details.Address || ""}
                {...register("Address", {
                  required: "Client Address is required",
                  maxLength: 50,
                })}
                isInvalid={isInputInvalid("Address")}
                errorMessage={errors.Address && errors.Address.message}
              />
              <Input
                type="text"
                label="Email"
                disabled={!isEditable}
                defaultValue={details.Email || ""}
                {...register("Email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email format (e.g email@example.com)",
                  },
                  required: "Email is required",
                })}
                isInvalid={isInputInvalid("Email")}
                errorMessage={errors.Email && errors.Email.message}
                autoComplete="off"
              />
              <Input
                type="text"
                label="Contact Person"
                disabled={!isEditable}
                defaultValue={details.ContactPerson || ""}
                {...register("ContactPerson", {
                  required: "Contact Person is required",
                  maxLength: 50,
                  validate: {
                    onlyLetters: (value) =>
                      isOnlyLetters(value) ||
                      "Contact Person should contain only letters",
                  },
                })}
                isInvalid={isInputInvalid("ContactPerson")}
                errorMessage={
                  errors.ContactPerson && errors.ContactPerson.message
                }
                autoComplete="off"
              />
              <Input
                type="text"
                label="Mobile Number"
                disabled={!isEditable}
                defaultValue={details.MobileNumber || ""}
                {...register("MobileNumber", {
                  required: "Mobile Number is required",
                  pattern: {
                    value: /^09\d{9}$/,
                    message: "Invalid Contact Number (e.g 09xxxxxxxxx)",
                  },
                })}
                isInvalid={isInputInvalid("MobileNumber")}
                errorMessage={
                  errors.MobileNumber && errors.MobileNumber.message
                }
                autoComplete="off"
              />
              <Input
                type="text"
                label="Landline Number"
                disabled={!isEditable}
                defaultValue={details.LandlineNumber || ""}
                {...register("LandlineNumber", {})}
                autoComplete="off"
              />

              <Input
                type="date"
                label="Date Software Acceptance "
                placeholder="dd/mm/yyyy"
                disabled={!isEditable}
                defaultValue={details.DateSoftwareAcceptance || ""}
                color={color}
                {...register("DateSoftwareAcceptance", {
                  required: "Date Software Acceptance  is required",
                  pattern: {
                    value:
                      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$|^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                    message: "Invalid date format (dd/mm/yyyy)",
                  },
                })}
                isInvalid={isInputInvalid("DateSoftwareAcceptance")}
                errorMessage={
                  errors.DateSoftwareAcceptance &&
                  errors.DateSoftwareAcceptance.message
                }
                autoComplete="off"
              />
              <Input
                type="date"
                label="Date BCS Expiry"
                disabled={!isEditable}
                placeholder="dd/mm/yyyy"
                color={color}
                defaultValue={details.DateBCSExpiry || ""}
                {...register("DateBCSExpiry", {
                  required: "Date BCS Expiry is required",
                  pattern: {
                    value:
                      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$|^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                    message: "Invalid date format (dd/mm/yyyy)",
                  },
                })}
                isInvalid={isInputInvalid("DateBCSExpiry")}
                errorMessage={
                  errors.DateBCSExpiry && errors.DateBCSExpiry.message
                }
                autoComplete="off"
              />
              <Input
                type="date"
                label="Date BCS Renewal"
                disabled={!isEditable}
                placeholder="dd/mm/yyyy"
                defaultValue={details.DateBCSRenewal || ""}
                {...register("DateBCSRenewal", {
                  required: "Date BCS Expiry is required",
                  pattern: {
                    value:
                      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$|^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
                    message: "Invalid date format (dd/mm/yyyy)",
                  },
                })}
                isInvalid={isInputInvalid("DateBCSRenewal")}
                errorMessage={
                  errors.DateBCSRenewal && errors.DateBCSRenewal.message
                }
                autoComplete="off"
              />
            </div>
          </div>
          <div className="pt-10 justify-end flex gap-4">
            <Button color="primary" variant="ghost" onClick={handleGoBack}>
              Back
            </Button>
            <Button
              color="primary"
              onClick={() => setIsModalOpen(true)}
              isDisabled={!canEdit || !isEditable}
            >
              Save Changes
            </Button>
            <ModalApp
              isOpen={isModalOpen}
              onOpenChange={setIsModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Edit Client"
              content="Proceed to Save Changes?"
              actionButtonLabel="Confirm"
              actionButtonOnClick={() => handleSubmit(onSubmit)()}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default EditClient;

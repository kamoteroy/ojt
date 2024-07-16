import React from "react";
import { Button, Divider, Input } from "@nextui-org/react";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axiosInstance from "../shared/axiosInstance";
import ToasterUtils from "../shared/ToasterUtils";
import addAuditTrail from "../shared/RecordAudit";

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-01-2024
 * PURPOSE/DESCRIPTION  : Handles ADD feature of client
 * PROGRAMMER           : Francis A. Cejudo
 * FUNCTION NAME        : AddClient
 *****************************************************************/
const AddClient = () => {
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,

    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (data.LandlineNumber === "") {
        delete data.LandlineNumber;
      }
      data.CreatedBy = currentUserId;
      data.UpdatedBy = currentUserId;

      const response = await axiosInstance.post(`/addrecord/Client`, data);
      const recordId = response.data.Id;

      await addAuditTrail(currentUserId, "AddClient", recordId, "Client");
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
        console.error("Error adding client:", error);
      }
    }
  };

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
        Add Client
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        Client Information
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Primary Information */}
        <div className="flex flex-col md:flex-row gap-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-3">
            <Input
              type="text"
              label="Name"
              {...register("Name", {
                required: "Name is required",
                maxLength: 50,
              })}
              isInvalid={isInputInvalid("Name")}
              errorMessage={errors.Name && errors.Name.message}
              autoComplete="off"
            />
            <Input
              type="text"
              label="Address"
              {...register("Address", {
                required: "Address is required",
                maxLength: 50,
              })}
              isInvalid={isInputInvalid("Address")}
              errorMessage={errors.Address && errors.Address.message}
              autoComplete="off"
            />
            <Input
              type="text"
              label="Email"
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
              type="number"
              label="Mobile Number"
              {...register("MobileNumber", {
                required: "Mobile Number is required",
                pattern: {
                  value: /^09\d{9}$/,
                  message: "Invalid Contact Number (e.g 09xxxxxxxxx)",
                },
              })}
              isInvalid={isInputInvalid("MobileNumber")}
              errorMessage={errors.MobileNumber && errors.MobileNumber.message}
              autoComplete="off"
            />
            <Input
              type="text"
              label="Landline Number"
              {...register("LandlineNumber", {})}
              autoComplete="off"
            />

            <Input
              type="date"
              label="Date Software Acceptance "
              placeholder="dd/mm/yyyy"
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
              placeholder="dd/mm/yyyy"
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
              placeholder="dd/mm/yyyy"
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
          <Button color="primary" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddClient;

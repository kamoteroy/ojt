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
import { MailIcon } from "../../icons/MailIcon.jsx";
import { PlusIcon } from "../../icons/PlusIcon.jsx";
import { SaveIcon } from "../../icons/SaveIcon.jsx";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";
import axiosInstance from "../shared/axiosInstance";
import { useForm } from "react-hook-form";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";

const EditTicketLineModal = ({
  isOpen,
  onOpenChange,
  onSuccess,
  ticketLineId,
  ticketLine,
}) => {
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const [selectedTicketLine, setSelectedTicketLine] = useState(null);
  const [categories, setCategories] = useState([]);
  const [touched, setTouched] = React.useState(false);
  const [dateFinished, setDateFinished] = useState(null);
  const [dateCalled, setDateCalled] = useState(null);
  const [actions, setActions] = useState(null);
  const [selectedTimeCalled, setSelectedTimeCalled] = useState("00:00");
  const [selectedTimeFinished, setselectedTimeFinished] = useState("00:00");

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const attachmentResponse = await axiosInstance.get(
          `/getrecord/TicketLine/Id/${ticketLineId}`
        );
        setSelectedTicketLine(attachmentResponse.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    /* fetchCategories(); */
    /* setValue("DateCalled", selectedTicketLine.DateCalled);
    setValue("DateFinished", selectedTicketLine.DateCalled);
    setValue("Action", selectedTicketLine.Action); */
  }, [isOpen, setValue]);
  const appendTimezone = (date) => (date ? date + ":00.000Z" : date);
  const onSubmit = async (data) => {
    console.log("ticketline123", data);
    try {
      data.DateCalled = appendTimezone(data.DateCalled);
      data.DateFinished = appendTimezone(data.DateFinished);

      const responseTicketLine = await axiosInstance.put(
        `/updaterecord/TicketLine/Id/${ticketLineId}`,
        data
      );

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(); // Call the onSuccess callback
      }
      await addAuditTrail(
        currentUserId,
        "EditTicketLine",
        ticketLineId,
        "TicketLine"
      );
      showMessage(`${responseTicketLine.data.message}`, "success");
    } catch (error) {
      console.error("Error updating Product:", error);
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

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const getTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
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
                  Edit TicketLine
                </ModalHeader>
                <ModalBody>
                  {ticketLine && (
                    <>
                      <Input
                        type="text"
                        label="Action"
                        autoComplete="off"
                        defaultValue={ticketLine.Action || ""}
                        {...register("Action")}
                        onChange={(e) =>
                          setActions(e.target.value + ":00.000Z")
                        }
                      />
                      <Input
                        type="datetime-local"
                        label="DateCalled"
                        autoComplete="off"
                        defaultValue={
                          ticketLine.DateCalled
                            ? `${new Date(ticketLine.DateCalled)
                                .toISOString()
                                .slice(0, 16)}`
                            : ""
                        }
                        {...register("DateCalled")}
                        onChange={(e) =>
                          setDateCalled(e.target.value + ":00.000Z")
                        }
                      />

                      <Input
                        type="datetime-local"
                        label="DateFinished"
                        autoComplete="off"
                        defaultValue={
                          ticketLine.DateFinished
                            ? new Date(ticketLine.DateFinished)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        {...register("DateFinished")}
                        onChange={(e) => setDateFinished(e.target.value)}
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
export default EditTicketLineModal;

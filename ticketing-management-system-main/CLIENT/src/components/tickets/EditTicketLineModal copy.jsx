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

const EditTicketLineModal = ({
  isOpen,
  onOpenChange,
  onSuccess,
  ticketLineId,
  ticketLine,
}) => {
  const { currentUserId } = useCurrentUser();
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
        setSelectedTicketLine(ticketLine);
        console.log("ticketline", selectedTicketLine);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    /* fetchCategories(); */
    setValue("DateCalled", `${dateCalled} ${selectedTimeCalled}`);
    setValue("DateFinished", `${dateFinished} ${selectedTimeFinished}`);
    setValue("Actions", actions);
  }, [isOpen, setValue]);

  const onSubmit = async (data) => {
    try {
      const ticketLineData = {
        DateCalled: `${dateCalled} ${selectedTimeCalled}`, // combine dateCalled and selectedTime
        DateFinished: `${dateFinished} ${selectedTimeFinished}`, // replace with actual dateFinished value
        Action: actions, // replace with actual actions value
      };

      if (Object.keys(ticketLineData).length > 0) {
        const responseTicketLine = await axiosInstance.put(
          `/updaterecord/TicketLine/Id/${ticketLineId}`,
          ticketLineData
        );
        console.log("ticketline", responseTicketLine.data);
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(); // Call the onSuccess callback
      }
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
                        onChange={(e) => setActions(e.target.value)}
                      />
                      <Input
                        type="date"
                        label="DateCalled"
                        autoComplete="off"
                        defaultValue={
                          ticketLine.DateCalled
                            ? new Date(ticketLine.DateCalled)
                                .toISOString()
                                .slice(0, 10)
                            : ""
                        }
                        onChange={(e) => setDateCalled(e.target.value)}
                      />
                      <Input
                        type="time"
                        // id="dateCalledTimePicker"
                        label="Time Called"
                        defaultValue={getTime(new Date(ticketLine.DateCalled))}
                        onChange={(e) => setSelectedTimeCalled(e.target.value)}
                      />
                      <Input
                        type="date"
                        label="DateFinished"
                        autoComplete="off"
                        defaultValue={
                          ticketLine.DateFinished
                            ? new Date(ticketLine.DateFinished)
                                .toISOString()
                                .slice(0, 10)
                            : ""
                        }
                        onChange={(e) => setDateFinished(e.target.value)}
                      />
                      <Input
                        type="time"
                        // id="dateCalledTimePicker"
                        label="Time Called"
                        defaultValue={getTime(
                          new Date(ticketLine.DateFinished)
                        )}
                        onChange={(e) =>
                          setselectedTimeFinished(e.target.value)
                        }
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

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";
import { SaveIcon } from "../../icons/SaveIcon.jsx";
import { CameraIcon } from "../../icons/CameraIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";

import axiosInstance from "../shared/axiosInstance";
import { BASE_URL } from "../../routes/BaseUrl";
import { useNavigate, useLocation } from "react-router-dom";

import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";

import { useForm } from "react-hook-form";

const AddTicketLineModal = ({ isOpen, onOpenChange, onSuccess, ticketId }) => {
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const [isExist, setExist] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dateFinished, setDateFinished] = useState(null);
  const [dateCalled, setDateCalled] = useState(null);
  const [selectedTimeCalled, setSelectedTimeCalled] = useState("00:00");
  const [selectedTimeFinished, setselectedTimeFinished] = useState("00:00");
  const [actions, setActions] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9), // generate a unique id
      }));

      setImageFile(e.target.files);
      setFileName(newImages.map((image) => image.file.name).join(", "));
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const removeImage = (id) => {
    setImages((prevImages) => {
      const newImages = prevImages.filter((image) => image.id !== id);
      setImageFile(newImages.map((image) => image.file));
      setFileName(newImages.map((image) => image.file.name).join(", "));
      return newImages;
    });
  };

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = async () => {
    try {
      const ticketLineData = {
        TicketId: ticketId,
        DateCalled: `${dateCalled} ${selectedTimeCalled}`, // combine dateCalled and selectedTime
        DateFinished: `${dateFinished} ${selectedTimeFinished}`, // replace with actual dateFinished value
        Action: actions, // replace with actual actions value
      };

      console.log("ticketlinedata", ticketLineData);
      if (dateFinished === null) {
        ticketLineData.DateFinished = null;
      }

      if (Object.keys(ticketLineData).length > 0) {
        const responseTicketLine = await axiosInstance.post(
          `/addrecordnocode/TicketLine`,
          ticketLineData
        );
        await addAuditTrail(
          currentUserId,
          "AddTicketLine",
          responseTicketLine.data.Id,
          "TicketLine"
        );
        showMessage(`${responseTicketLine.data.message}`, "success");
        console.log("ticketline", responseTicketLine.data);
      }

      if (onSuccess) {
        onOpenChange(false);
        onSuccess();
      }
    } catch (error) {
      if (error.response) {
        console.log("Message", error.response.data.message);
        setExist(error.response.data.error);

        if (error.response.data.message == "Record Already Exist") {
          setError("Username", {
            type: "manual",
            message: "Username already exist",
          });
        }
      } else {
        console.log("Error", error.message);
      }
    }
  };

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };

  // Reset errors when the modal is opened
  useEffect(() => {
    if (isOpen) {
      clearErrors();
    }
  }, [isOpen, clearErrors]);

  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };
  console.log(errors);

  const [size, setSize] = React.useState("md");

  const sizes = ["2xl"];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={true}
        isKeyboardDismissDisabled={true}
        placement="top-center"
        size={sizes}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-center">
                  Add TicketLine
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-6 pb-6">
                      {/* <label htmlFor="timePicker">Select a time:</label> */}
                      <Input
                        type="date"
                        placeholder="Date Called"
                        label="DateCalled"
                        onChange={(e) => setDateCalled(e.target.value)}
                        /* {...register("DateCalled", {
                required: "Date Called is required",
              })} */
                      />
                      <Input
                        type="time"
                        // id="dateCalledTimePicker"
                        label="Time Called"
                        value={selectedTimeCalled}
                        onChange={(e) => setSelectedTimeCalled(e.target.value)}
                        // {...register("timeCalled", {
                        //   required: "Time called is required",
                        // })}
                      />
                      <Input
                        type="date"
                        placeholder="Date Finished"
                        label="DateFinished"
                        onChange={(e) => setDateFinished(e.target.value)}
                        /* {...register("DateFinished", {
                required: "Date Finished is required",
              })} */
                      />
                      <Input
                        type="time"
                        // id="dateFinishedTimePicker"
                        label="Time Finished"
                        value={selectedTimeFinished}
                        onChange={(e) =>
                          setselectedTimeFinished(e.target.value)
                        }
                        // {...register("timeFinished", {
                        //   required: "Time finished is required",
                        // })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <Textarea
                      maxRows={3}
                      type="text"
                      label="Action"
                      onChange={(e) => setActions(e.target.value)}
                      autoComplete="off"
                      /* {...register("Action", {
              required: "Action is required",
            })} */
                    />
                  </div>
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

export default AddTicketLineModal;

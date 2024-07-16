import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { SaveIcon } from "../../icons/SaveIcon.jsx";
import { CameraIcon } from "../../icons/CameraIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { useCurrentUser } from "../../auth/CurrentUserContext.jsx";

import axiosInstance from "../shared/axiosInstance";
import { BASE_URL } from "../../routes/BaseUrl";
import { useNavigate, useLocation } from "react-router-dom";

import { useForm } from "react-hook-form";

const AddAttachmentModal = ({ isOpen, onOpenChange, onSuccess, ticketId }) => {
  const { currentUserId } = useCurrentUser();
  const [isExist, setExist] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
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
    const isEditTicket = location.pathname.includes("editticket");
    const isDetailsTicket = location.pathname.includes("ticketdetails");
    const formData = new FormData();

    /* append multiple files */
    for (let i = 0; i < imageFile.length; i++) {
      formData.append("image", imageFile[i]);
    }

    console.log("TicketId", Number(ticketId));
    const responseTicketID = await axiosInstance.get(
      `/getrecord/TicketReview/TicketId/${ticketId}`
    );
    formData.append(
      isEditTicket || isDetailsTicket ? "TicketId" : "TicketReviewId",
      isEditTicket || isDetailsTicket
        ? Number(ticketId)
        : Number(responseTicketID.data.Id)
    );

    try {
      if (imageFile) {
        const uploadResponse = await axiosInstance.post(
          `${BASE_URL}/uploadattachment/Attachment`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Image uploaded successfully:", uploadResponse.data);
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
                  Add Attachment
                </ModalHeader>
                <ModalBody>
                  <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
                    {/* Upload Image Button */}
                    <div className=" relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100 min-h-unit-10 rounded-medium flex-row items-center justify-start gap-0 transition-background motion-reduce:transition-none !duration-150 outline-none group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background h-14 py-2">
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        name="image"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        style={{ zIndex: 1 }}
                        multiple
                      />
                      <label
                        htmlFor="file-upload"
                        className="absolute inset-0 flex items-center justify-start cursor-pointer pl-3"
                      >
                        <CameraIcon className="h-5 w-5" />
                      </label>
                      <div className="absolute inset-0 flex items-center justify-start cursor-pointer overflow-hidden pl-10 pr-3">
                        <div className="whitespace-nowrap overflow-ellipsis overflow-hidden text-sm">
                          {images.length
                            ? `${images.length} image(s) uploaded`
                            : "Upload Image"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {/* Display Image */}
                    <div className="flex flex-wrap mt-3 pb-10">
                      {images.map((image) => (
                        <div key={image.id} className="relative m-1">
                          <img
                            src={URL.createObjectURL(image.file)}
                            alt="Uploaded"
                            className="w-24 h-24 object-cover"
                          />
                          <button
                            onClick={() => removeImage(image.id)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
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

export default AddAttachmentModal;

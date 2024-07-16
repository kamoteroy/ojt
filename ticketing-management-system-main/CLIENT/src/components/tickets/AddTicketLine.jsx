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
  Textarea,
} from "@nextui-org/react";
import {
  SelectTicketSeverity,
  SelectTicketCategory,
} from "../../data/SelectData";
import { CameraIcon } from "../../icons/CameraIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import { useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import axiosInstance from "../shared/axiosInstance";
import { columns, statusOptions } from "../../data/TicketsData";

const AddTicketLine = () => {
  const [imageLines, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [products, setProducts] = useState([]);
  const [ticketId, setTicketId] = useState();
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
    // formData.append("image", imageFile);

    /* append multiple files */
    for (let i = 0; i < imageFile.length; i++) {
      formData.append("image", imageFile[i]);
    }

    formData.append("TicketId", ticketId);

    try {
      ["AnsweredBy", "CreatedBy", "UpdatedBy"].forEach((prop) => {
        data[prop] = currentUserId;
      });
      data.DoneDate = new Date();
      data.IsReviewed = 1;
      const response = await axiosInstance.post(`/addrecord/Ticket`, data);
      if (imageFile) {
        const uploadResponse = await axios.post(
          `${BASE_URL}/uploadattachment/Attachment`,
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
  // console.log(errors);

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchName = async () => {
      try {
        const ticketResponse = await axiosInstance.get("/getallrecord/Ticket");
        const latestTicketId =
          ticketResponse.data[ticketResponse.data.length - 1].Id;
        setTicketId(latestTicketId + 1);

        const userResponse = await axiosInstance.get(`/getallrecord/User`);
        setUsers(userResponse.data);

        const clientResponse = await axiosInstance.get(`/getallrecord/Client`);
        setClients(clientResponse.data);

        const productResponse = await axiosInstance.get(
          `/getallrecord/Product`
        );
        setProducts(productResponse.data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    fetchName();

    /*  if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageFile);
    } */
  }, []);

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };
  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };
//   const handleImageUpload = (e) => {
//     if (e.target.files) {
//       const newImages = Array.from(e.target.files).map((file) => ({
//         file,
//         id: Math.random().toString(36).substr(2, 9), // generate a unique id
//       }));

//       setImageFile(e.target.files);
//       setFileName(newImages.map((image) => image.file.name).join(", "));
//       setImages((prevImages) => [...prevImages, ...newImages]);
//     }
//   };

//   const removeImage = (id) => {
//     setImages((prevImages) => {
//       const newImages = prevImages.filter((image) => image.id !== id);
//       setImageFile(newImages.map((image) => image.file));
//       setFileName(newImages.map((image) => image.file.name).join(", "));
//       return newImages;
//     });
//   };

const [selectedTime, setSelectedTime] = useState("00:00");

const handleTimeChange = (event) => {
  setSelectedTime(event.target.value);
};

  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">
        Ticket Line
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        {/* Primary Information */}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-6 pb-6">
            {/* <label htmlFor="timePicker">Select a time:</label> */}
            <Input 
              type="date" 
              placeholder="Date Called" 
              label="Date Called" 
              {...register("dateCalled", {
                required: "Date Called is required",
              })}
            />
            <Input
              type="time"
              // id="dateCalledTimePicker"
              label="Time Called"
              value={selectedTime}
              onChange={handleTimeChange}
              {...register("timeCalled", {
                required: "Time called is required",
              })}
            />
            <Input
              type="date"
              placeholder="Date Finished"
              label="Date Finished"
              {...register("dateFinished", {
                required: "Date Finished is required",
              })}
            />
            <Input
              type="time"
              // id="dateFinishedTimePicker"
              label="Time Finished"
              value={selectedTime}
              onChange={handleTimeChange}
              // {...register("timeFinished", {
              //   required: "Time finished is required",
              // })}
            />
          </div>
        </div>
            </form>
        <div className="flex flex-col md:flex-row gap-3">
          <Textarea 
            maxRows={3} 
            type="text" 
            label="Action" 
            // {...register("Action", {
            //       required: "Action is required",
            // })}
          />
        </div>
          
    </div>
  );
};

export default AddTicketLine;

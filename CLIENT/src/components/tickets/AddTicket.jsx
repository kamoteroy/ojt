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
import AddTicketLine from "./AddTicketLine";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";
import {
  sendAllNotification,
  sendNotification,
} from "../shared/SendNotification";

const AddTicket = () => {
  const { showMessage } = ToasterUtils();
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [images, setImages] = useState([]);
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
  const [dateFinished, setDateFinished] = useState(null);
  const [dateCalled, setDateCalled] = useState(null);
  const [selectedTimeCalled, setSelectedTimeCalled] = useState("00:00");
  const [selectedTimeFinished, setselectedTimeFinished] = useState("00:00");
  const [actions, setActions] = useState(null);
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
    if (imageFile) {
      for (let i = 0; i < imageFile.length; i++) {
        formData.append("image", imageFile[i]);
      }
    }

    try {
      ["AnsweredBy", "CreatedBy", "UpdatedBy"].forEach((prop) => {
        data[prop] = currentUserId;
      });
      /* data.DoneDate = null; */
      data.IsReviewed = 0;
      data.Status = 0;
      if (
        data.Remarks === "" ||
        data.Remarks === null ||
        data.Remarks === undefined
      ) {
        delete data.Remarks;
      }
      // data.Remarks = data.Remarks === "" ? null : data.Remarks;
      console.log("ticketOnSubmitData", data);
      const response = await axiosInstance.post(`/addrecord/Ticket`, data);
      const recordId = response.data.Id;

      const ticketReviewData = {
        TicketId: response.data.Id,
        ReviewedBy: currentUserId,
        SatisfactoryRate: 0,
        CreatedBy: currentUserId,
        DateCreated: new Date(),
      };
      const responseTicketReview = await axiosInstance.post(
        `/addrecord/TicketReview`,
        ticketReviewData
      );
      console.log("responseTicketReview", responseTicketReview.data);

      formData.append("TicketId", response.data.Id);

      const ticketLineData = {
        TicketId: response.data.Id,
        DateCalled: `${dateCalled} ${selectedTimeCalled}`, // combine dateCalled and selectedTime
        DateFinished: `${dateFinished} ${selectedTimeFinished}`, // replace with actual dateFinished value
        Action: actions, // replace with actual actions value
      };

      console.log("ticketlinedata", Object.values(ticketLineData));

      const checkTicketLineData = Object.values(ticketLineData).some(
        (value) => {
          // Convert value to a string if it's not an object
          if (typeof value !== "object") {
            value = String(value);
          }

          // Convert value to an array if it's an object
          if (typeof value === "object") {
            value = Object.values(value);
          }

          return value.includes("null");
        }
      );
      console.log("checkticketlinedata", checkTicketLineData);

      if (!checkTicketLineData) {
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
        showMessage(`${response.data.message}`, "success");
        console.log("ticketline", responseTicketLine.data);
      }
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
      console.log("nganu", assignedToUserId);
      await sendNotification(
        assignedToUserId,
        "You are assigned with a new Ticket issue",
        "/tickets"
      );
      await addAuditTrail(currentUserId, "AddTicket", recordId, "Ticket");
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      console.log("Message", error);
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
  }, []);

  const isInputInvalid = (inputName) => {
    return !!errors[inputName];
  };
  const isOnlyLetters = (value) => {
    return /^[a-zA-Z\s]*$/.test(value);
  };
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

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">
        Add Ticket
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        Ticket Information
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full  grid grid-row-1 pb-3 md:grid-row-3 gap-2">
          <Input
            type="text"
            label="Caller"
            {...register("Caller", {
              required: "Caller is required",
              maxLength: 50,
              validate: {
                onlyLetters: (value) =>
                  isOnlyLetters(value) || "Caller should contain only letters",
              },
            })}
            isInvalid={isInputInvalid("Caller")}
            errorMessage={errors.Caller && errors.Caller.message}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3 ">
          <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-2 gap-2 ">
            <Select
              className=" mb-0 py-0 "
              label="Answered By"
              placeholder="Answered By"
              {...register("AnsweredBy", {
                required: "AnsweredBy is required",
              })}
              isInvalid={isInputInvalid("AssignedBy")}
              errorMessage={errors.AnsweredBy && errors.AnsweredBy.message}
            >
              {users.map((user) => (
                <SelectItem key={user.Id} value={user.Id}>
                  {`${user.Firstname} ${user.Lastname}`}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Client"
              className=" mb-0 py-0 "
              placeholder="Select Client"
              {...register("ClientId", {
                required: "Client is required",
              })}
              isInvalid={isInputInvalid("ClientId")}
              errorMessage={errors.ClientId && errors.ClientId.message}
            >
              {clients.map((client) => (
                <SelectItem key={client.Id} value={client.Id}>
                  {client.Name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Product"
              placeholder="Select Product"
              {...register("ProductId", {
                required: "Product is required",
              })}
              isInvalid={isInputInvalid("ProductId")}
              errorMessage={errors.ProductId && errors.ProductId.message}
            >
              {products.map((product) => (
                <SelectItem key={product.Id} value={product.Id}>
                  {product.Name}
                </SelectItem>
              ))}
            </Select>

            <Textarea
              maxRows={3}
              type="text"
              label="Concern"
              {...register("Concern", {
                required: "Concern is required",
                maxLength: 50,
                validate: {
                  onlyLetters: (value) =>
                    isOnlyLetters(value) ||
                    "Concern should contain only letters",
                },
              })}
              isInvalid={isInputInvalid("Concern")}
              errorMessage={errors.Concern && errors.Concern.message}
              autoComplete="off"
            />
            <Input type="hidden" className="invisible" label="placeholder" />
          </div>
          <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2 ">
            <Select
              label="Assigned To"
              className="mb-0 py-0 "
              placeholder="Assigned To"
              {...register("AssignedBy", {
                required: "AssignedBy is required",
                onChange: (e) => {
                  const selectedUserId = e.target.value;
                  setAssignedToUserId(selectedUserId);
                },
              })}
              isInvalid={isInputInvalid("AssignedBy")}
              errorMessage={errors.AssignedBy && errors.AssignedBy.message}
            >
              {users.map((user) => (
                <SelectItem key={user.Id} value={user.Id}>
                  {`${user.Firstname} ${user.Lastname}`}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Category"
              className="pb-0 py-0 "
              placeholder="Select Category"
              {...register("Category", {
                required: "Category is required",
              })}
              isInvalid={isInputInvalid("Category")}
              errorMessage={errors.Category && errors.Category.message}
            >
              {SelectTicketCategory.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Severity"
              placeholder="Select Severity"
              {...register("Severity", {
                required: "Severity is required",
              })}
              isInvalid={isInputInvalid("Severity")}
              errorMessage={errors.Severity && errors.Severity.message}
            >
              {SelectTicketSeverity.map((severity) => (
                <SelectItem key={severity.value} value={severity.value}>
                  {severity.label}
                </SelectItem>
              ))}
            </Select>
            <Textarea
              maxRows={3}
              type="text"
              label="Remarks"
              {...register("Remarks")}
              isInvalid={isInputInvalid("Remarks")}
              errorMessage={errors.Remarks && errors.Remarks.message}
              autoComplete="off"
            />
            <Input type="hidden" className="invisible" label="placeholder" />
            {/* <Textarea
              maxRows={3}
              type="text"
              label="Solution"
              {...register("Solution", {
                required: "Solution is required",
              })}
              isInvalid={isInputInvalid("Solution")}
              errorMessage={errors.Solution && errors.Solution.message}
            /> */}
          </div>
        </div>
        <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2 ">
          {/* Upload Image Button */}
          <span>
            <small> i Attach image for</small>
          </span>
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
        {/* Ticket Line */}
        {/* <div className="flex flex-row text-2xl font-bold uppercase pt-10">
          Ticket Line
        </div>
        <Divider />
        <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center pt-5">
          <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-6 pb-6">
            <Input
              type="date"
              placeholder="Date Called"
              label="DateCalled"
              onChange={(e) => setDateCalled(e.target.value)}
            />
            <Input
              type="time"
              label="Time Called"
              value={selectedTimeCalled}
              onChange={(e) => setSelectedTimeCalled(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Date Finished"
              label="DateFinished"
              onChange={(e) => setDateFinished(e.target.value)}
            />
            <Input
              type="time"
              label="Time Finished"
              value={selectedTimeFinished}
              onChange={(e) => setselectedTimeFinished(e.target.value)}
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
          />
        </div> */}
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

export default AddTicket;

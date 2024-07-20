import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Image,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import { EyeFilledIcon } from "../../icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../../icons/EyeSlashFilledIcon";
import { SelectGender } from "../../data/SelectData";
import { CameraIcon } from "../../icons/CameraIcon";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import {
  SelectTicketSeverity,
  SelectTicketCategory,
} from "../../data/SelectData";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ModalApp from "../shared/Modal";
import axiosInstance from "../shared/axiosInstance";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import { columns, statusOptions } from "../../data/TicketsData";
import { formatDate, formatAMPM } from "../shared/FormatDate";
import { set, useForm } from "react-hook-form";
import AttachmentTable from "./AttachmentTable";
import TicketLineTable from "./TicketLineTable";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";
import GetPermission from "../shared/GetPermission.jsx";
import { EditIcon } from "../../icons/EditIcon";
import Breadcrumbs from "../../routes/breadcrumb.jsx";

const EditTicket = () => {
  const { showMessage } = ToasterUtils();
  const { ticketid } = useParams();
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [clients, setClients] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [products, setProducts] = useState([]);
  const [ticketId, setTicketId] = useState();
  const { currentUserId } = useCurrentUser();
  const [isExist, setExist] = useState();
  const [dateFinished, setDateFinished] = useState(null);
  const [dateCalled, setDateCalled] = useState(null);
  const [selectedTimeCalled, setSelectedTimeCalled] = useState("00:00");
  const [selectedTimeFinished, setselectedTimeFinished] = useState("00:00");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [actions, setActions] = useState(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm();
  //permissions
  const permissions = GetPermission() || [];
  console.log("permissions: ", permissions);
  const canEdit = permissions.includes("EditTicket");
  const [isEditable, setIsEditable] = useState(false);
  const [text, setText] = useState("USER DETAILS");
  const location = useLocation();

  const handleEditToggle = () => {
    setIsEditable(!isEditable);
    text === "USER DETAILS"
      ? setText("EDIT USER DETAILS")
      : setText("USER DETAILS");
  };

  const onSubmit = async (data) => {
    try {
      ["UpdatedBy"].forEach((prop) => {
        data[prop] = currentUserId;
      });
      data.DateUpdated = new Date();
      console.log(
        "Number(data.Status) === 1 && Number(tickets.Status) === 0",
        Number(data.Status) === 1 && Number(tickets.Status) === 0
      );
      Object.keys(data).forEach((key) => {
        if (!data[key]) {
          data[key] = tickets[key];
        }
      });
      if (Number(data.Status) === 1 && Number(tickets.Status) === 0) {
        data.DoneDate = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
      } else {
        data.DoneDate = null;
      }
      const response = await axiosInstance.put(
        `/updaterecord/Ticket/Id/${ticketid}`,
        data
      );

      await addAuditTrail(currentUserId, "EditTicket", ticketid, "Ticket");
      showMessage(`${response.data.message}`, "success");

      console.log("Ticket updated successfully:", response.data);
      setIsModalOpen(false);
    } catch (error) {
      console.log("Message", error);
      setExist(error.response.data.error);

      /* if (error.response.data.message == "Record Already Exist") {
        setError("Username", {
          type: "manual",
          message: "Username already exist",
        });
      } else {
        console.error("Error adding user:", error);
      } */
    }
    handleGoBack();
  };
  useEffect(() => {
    const fetchName = async () => {
      try {
        const ticketResponse = await axiosInstance.get(
          `/getsingleticketclientuserproduct/Ticket/${ticketid}`
        );

        const dataArray = Array.isArray(ticketResponse.data)
          ? ticketResponse.data
          : [ticketResponse.data];

        /*  const formattedClientData = [clientClientIdResponses[0].data].map(
          (item, index) => {
            const formatDate = (date) =>
              new Date(date).toISOString().slice(0, 10);

            const formattedDateBCSExpiry = formatDate(item.DateBCSExpiry);

            return {
              ...item,
              DateBCSExpiry: formattedDateBCSExpiry,
            };
          }
        ); */

        const formattedData = dataArray.map((item, index) => {
          return {
            ...item,
            DateCreated: `${formatDate(item.DateCreated[0])} ${formatAMPM(
              item.DateCreated[0]
            )}`,
            Category: item.Category[0],
            ProductName: item.Name[0],
            ClientName: item.Name[1],
            DateBCSExpiry: `${formatDate(item.DateBCSExpiry)} ${formatAMPM(
              item.DateBCSExpiry
            )}`,
          };
        });
        console.log("Formatted Data:", formattedData[0]);

        setTickets(formattedData[0]);
        console.log("setticket", formattedData[0]);

        const userResponse = await axiosInstance.get(`/getallrecord/User`);
        setUsers(userResponse.data);
        console.log("setusers", userResponse.data);

        const clientResponse = await axiosInstance.get(`/getallrecord/Client`);
        setClients(clientResponse.data);
        console.log("setclients", clientResponse.data);

        const productResponse = await axiosInstance.get(
          `/getallrecord/Product`
        );
        setProducts(productResponse.data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchName();
    setValue("AssignedBy", tickets.AssignedBy);
    setValue("ClientId", tickets.ClientId);
    setValue("ProductId", tickets.ProductId);
    setValue("Caller", tickets.Caller);
    setValue("Concern", tickets.Concern);
    setValue("AnsweredBy", tickets.AnsweredBy);
    setValue("Remarks", tickets.Remarks);
    setValue("Category", tickets.Category);
    setValue("Severity", tickets.Severity);
    setValue("Solution", tickets.Solution);
    setValue("Status", tickets.Status);
  }, [setValue]);

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

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  return (
    <>
      <Breadcrumbs name={location.state} />
      <div className="bg-white min-h-fit py-10 px-8">
        <div className="flex flex-row text-2xl font-bold uppercase">
          Edit Ticket
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            className={`-mt-4 text-lg text-default-400 cursor-pointer active:opacity-50 ml-auto`}
            onClick={handleEditToggle}
          >
            <EditIcon />
          </Button>
        </div>

        <Divider />

        <div className="flex-row py-3 uppercase font-bold pb-14">
          Ticket Number: {tickets.TicketNumber || ""}
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
              <Select
                label="Assigned To"
                name="AssignedBy"
                placeholder={tickets.UserAssignedBy || ""}
                {...register("AssignedBy")}
                isInvalid={isInputInvalid("AssignedBy")}
                errorMessage={errors.AssignedBy && errors.AssignedBy.message}
              >
                {users.map((user) => (
                  <SelectItem
                    key={user.Id}
                    value={user.Id}
                    isDisabled={!isEditable}
                  >
                    {`${user.Firstname} ${user.Lastname}`}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Client"
                name="ClientId"
                placeholder={tickets.ClientName || ""}
                {...register("ClientId")}
                isInvalid={isInputInvalid("ClientId")}
                errorMessage={errors.ClientId && errors.ClientId.message}
              >
                {clients.map((client) => (
                  <SelectItem
                    key={client.Id}
                    value={client.Id}
                    isDisabled={!isEditable}
                  >
                    {client.Name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Product"
                placeholder={tickets.ProductName || ""}
                {...register("ProductId")}
                isInvalid={isInputInvalid("ProductId")}
                errorMessage={errors.ProductId && errors.ProductId.message}
              >
                {products.map((product) => (
                  <SelectItem
                    key={product.Id}
                    value={product.Id}
                    isDisabled={!isEditable}
                  >
                    {product.Name}
                  </SelectItem>
                ))}
              </Select>
              <Input
                type="text"
                disabled={!isEditable}
                label="Caller"
                placeholder={tickets.Caller || ""}
                {...register("Caller", {
                  maxLength: 50,
                  validate: {
                    onlyLetters: (value) =>
                      isOnlyLetters(value) ||
                      "Caller should contain only letters",
                  },
                })}
                isInvalid={isInputInvalid("Caller")}
                errorMessage={errors.Caller && errors.Caller.message}
                autoComplete="off"
              />
              <Textarea
                maxRows={3}
                type="text"
                disabled={!isEditable}
                label="Concern"
                placeholder={tickets.Concern || ""}
                {...register("Concern", {
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
            </div>

            <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
              <Select
                label="Answered By"
                placeholder={tickets.UserAnsweredBy || ""}
                {...register("AnsweredBy")}
                isInvalid={isInputInvalid("AssignedBy")}
                errorMessage={errors.AnsweredBy && errors.AnsweredBy.message}
              >
                {users.map((user) => (
                  <SelectItem
                    key={user.Id}
                    value={user.Id}
                    isDisabled={!isEditable}
                  >
                    {`${user.Firstname} ${user.Lastname}`}
                  </SelectItem>
                ))}
              </Select>
              <Textarea
                maxRows={3}
                type="text"
                disabled={!isEditable}
                label="Remarks"
                placeholder={tickets.Remarks == "null" ? "" : tickets.Remarks}
                {...register("Remarks", {
                  validate: {
                    onlyLetters: (value) =>
                      isOnlyLetters(value) ||
                      "Remarks should contain only letters",
                  },
                })}
                isInvalid={isInputInvalid("Remarks")}
                errorMessage={errors.Remarks && errors.Remarks.message}
                autoComplete="off"
              />
              <Select
                label="Category"
                placeholder={tickets.Category || ""}
                {...register("Category")}
                isInvalid={isInputInvalid("Category")}
                errorMessage={errors.Category && errors.Category.message}
              >
                {SelectTicketCategory.map((category) => (
                  <SelectItem
                    key={category.value}
                    value={category.value}
                    isDisabled={!isEditable}
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Severity"
                placeholder={tickets.Severity || ""}
                {...register("Severity")}
                isInvalid={isInputInvalid("Severity")}
                errorMessage={errors.Severity && errors.Severity.message}
              >
                {SelectTicketSeverity.map((severity) => (
                  <SelectItem
                    key={severity.value}
                    value={severity.value}
                    isDisabled={!isEditable}
                  >
                    {severity.label}
                  </SelectItem>
                ))}
              </Select>
              {/*  <Textarea
              maxRows={3}
              type="text"
              label="Solution"
              placeholder={tickets.Solution || ""}
              {...register("Solution")}
              isInvalid={isInputInvalid("Solution")}
              errorMessage={errors.Solution && errors.Solution.message}
            /> */}
              <Select
                label="Status"
                placeholder={tickets.Status == 0 ? "Ongoing" : "Solved"}
                {...register("Status")}
              >
                {statusOptions.map((status) => (
                  <SelectItem
                    key={parseInt(status.value)}
                    value={parseInt(status.value)}
                    isDisabled={!isEditable}
                  >
                    {status.name}
                  </SelectItem>
                ))}
              </Select>
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
              title="Edit Ticket"
              content="Proceed to Save Changes?"
              actionButtonLabel="Confirm"
              actionButtonOnClick={handleSubmit(onSubmit)}
            />
          </div>
        </form>
        <AttachmentTable ticketId={ticketid} />
        <TicketLineTable ticketId={ticketid} />
      </div>
    </>
  );
};

export default EditTicket;

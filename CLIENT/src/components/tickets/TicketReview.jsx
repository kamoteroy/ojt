import React, { useState, useEffect } from "react";
import { Divider, Input, Textarea, Button } from "@nextui-org/react";
import StarRating from "./StarRating";
import { useNavigate, useParams } from "react-router-dom";
import AttachmentReviewTable from "./AttachmentReviewTable";
import { CameraIcon } from "../../icons/CameraIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import StarIcon from "../../icons/StarIcon";
import { set, useForm } from "react-hook-form";
import axiosInstance from "../shared/axiosInstance";
import { formatAMPM, formatDate } from "../shared/FormatDate";
import { useCurrentUser } from "../../auth/CurrentUserContext";

const TicketReview = () => {
  const { ticketid } = useParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [details, setDetails] = useState("");
  const [ticketReviewDetails, setTicketReviewDetails] = useState("");
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);
  const [exist, setExist] = useState(false);
  const { currentUserId } = useCurrentUser();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseTicketReview = await axiosInstance.get(
          `/getrecord/TicketReview/TicketId/${Number(ticketid)}`
        );
        const userReponse = await axiosInstance.get(
          `/getsingleticketclientuserproduct/Ticket/${ticketid}`
        );
        const dataArray = Array.isArray(userReponse.data)
          ? userReponse.data
          : [userReponse.data];

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
        setDetails(formattedData[0]);

        console.log("Ticket Review:", responseTicketReview.data);
        setTicketReviewDetails(responseTicketReview.data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchData();
  }, []);

  const updateTicketTable = async (data) => {
    try {
      const response = await axiosInstance.put(
        `/updaterecord/Ticket/Id/${Number(ticketid)}`,
        data
      );
      console.log("Ticket updated successfully:", response);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      ["ReviewedBy", "CreatedBy", "UpdatedBy"].forEach((prop) => {
        data[prop] = currentUserId;
      });
      data.DateCreated = new Date();
      data.DateUpdated = new Date();
      /* data.TicketId = ticketReviewDetails.TicketId; */
      data.SatisfactoryRate = Number(rating);
      console.log("ticketReviewDetails", ticketReviewDetails.TicketId);

      const response = await axiosInstance.put(
        `/updaterecord/TicketReview/Id/${ticketReviewDetails.Id}`,
        data
      );
      console.log("User added successfully:", response);

      const ticketData = {
        IsReviewed: 1,
      };
      updateTicketTable(ticketData);
    } catch (error) {
      console.log("Message", error.response);
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

  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">
        Ticket Review
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-5">
        Ticket Review Number : {ticketReviewDetails.TicketReviewNumber}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <div className="flex flex-col md:flex-row gap-3 mt-4"> */}
        {/* 
          
          <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
            <Input
              type="text"
              label="Reviewed By"
              {...register("ReviewedBy", {
                required: "Reviewed By is required",
              })}
            />
          </div>
          <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
            <Input
              type="text"
              label="Created By"
              {...register("CreatedBy", {
                required: "Created By is required",
              })}
            />
          </div> 
          */}
        {/* </div> */}
        <div className="flex flex-row text-2xl font-bold p-5 text-justify justify-center">
          Satisfactory Rate
        </div>
        {/* <StarRating /> */}
        <div className="flex justify-center pb-5">
          {[...Array(5)].map((_, index) => {
            const currentRating = index + 1;
            return (
              <label key={index}>
                <input
                  type="radio"
                  name="rating"
                  style={{ display: "none" }}
                  value={currentRating}
                  onClick={() => setRating(currentRating)}
                />
                <StarIcon
                  className="cursor-pointer" //di mugana ang hover
                  style={{ cursor: "pointer" }}
                  size={50}
                  color={
                    currentRating <= (hover || rating) ? "#ffc107" : "#e4e5e9"
                  }
                  onMouseEnter={() => setHover(currentRating)}
                  onMouseLeave={() => setHover(null)}
                />
              </label>
            );
          })}
        </div>
        <div className="flex flex-col md:flex-row gap-3 pb-10 mb-5">
          <Textarea
            maxRows={3}
            type="text"
            label="Comments"
            {...register("Comments", {
              // required: "Created By is required",
            })}
          />
        </div>
        {/*  <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
            <Input
              type="date"
              placeholder="Date Created"
              label="Date Created"
               {...register("DateCreated", {
                required: "Date Created is required",
              })}
            />
          </div>
          <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
            <Input
              type="text"
              label="Updated By"
              {...register("UpdatedBy", {
                // required: "Created By is required",
              })}
            />
          </div>
        </div> */}
        <div className="pt-10 justify-end flex gap-4">
          <Button color="primary" variant="ghost" onClick={handleGoBack}>
            Back
          </Button>
          <Button color="primary" type="submit">
            Submit
          </Button>
        </div>
        <AttachmentReviewTable ticketId={ticketid} />
      </form>
      <div className="pt-10 justify-end flex gap-4">
        {/*  <Button
          color="primary"
          variant="ghost"
          onClick={() => navigate(`/tickets`)}
        >
          Back
        </Button> */}
      </div>
    </div>
  );
};

export default TicketReview;

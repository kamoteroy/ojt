import React, { useEffect, useState } from "react";
import { Button, Divider, Image, Input, Textarea } from "@nextui-org/react";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../shared/axiosInstance";
import TicketLineDetails from "./TicketLineDetails";
import { formatDate, formatAMPM } from "../shared/FormatDate";
import AttachmentTable from "./AttachmentTable";
import TicketLineTable from "./TicketLineTable";

const TicketDetails = React.forwardRef((props, ref) => {
  const { ticketid } = useParams();
  const [details, setDetails] = useState("");
  const [users, setUsers] = useState("");
  const [clients, setClients] = useState("");
  const [products, setProducts] = useState("");
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        // Now you have responses from User, Client, and Product tables
        // You can process these responses as needed
        setDetails(formattedData[0]);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex items-center w-full ">
        <div className="flex  items-center w-full ">
          <div className="text-2xl font-bold uppercase w-70  justify-items-end flex items-center">
            <span> Ticket Details </span>
          </div>
          <div className="flex justify-item-end w-full">
            TicketNo:
            <span className="text-note ">{details.TicketNumber || ""}</span>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col md:flex-row gap-16 pb-3 mt-3">
        <div className="grid grid-cols-1 pb-3 md:grid-cols-3 w-full gap-6">
          <Input
            type="text"
            label="Date"
            value={details.DateCreated || ""}
            readOnly
          />
          <Input
            type="text"
            label="Answered By"
            value={details.UserAnsweredBy || ""}
            readOnly
          />
          <Input
            type="text"
            label="Assigned To"
            value={details.UserAssignedBy || ""}
            readOnly
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
          <Input
            type="text"
            label="Client"
            value={details.ClientName || ""}
            readOnly
          />
          <Input
            type="text"
            label="Product"
            value={details.ProductName || ""}
            readOnly
          />
          <Input
            type="text"
            label="Caller"
            value={details.Caller || ""}
            readOnly
          />
          <Textarea
            maxRows={3}
            type="text"
            label="Concern"
            value={details.Concern || ""}
            readOnly
          />
        </div>
        <div className="w-full md:w-1/2 grid grid-row-1 pb-3 md:grid-row-3 gap-2">
          <Textarea
            maxRows={3}
            type="text"
            label="Remarks"
            value={details.Remarks || ""}
            readOnly
          />
          <Input
            type="text"
            label="Category"
            value={details.Category || ""}
            readOnly
          />
          <Input
            type="text"
            label="Severity"
            value={details.Severity || ""}
            readOnly
          />
          <Textarea
            maxRows={3}
            type="text"
            label="Solution"
            value={details.Solution || details.Solution || ""}
          />
          <Input
            type="text"
            label="Status"
            value={details.Status == 0 ? "Ongoing" : "Solved" || ""}
            readOnly
          />
        </div>
      </div>
      <AttachmentTable ticketId={ticketid} />
      <TicketLineTable ticketId={ticketid} />
      <div className="pt-10 justify-end flex gap-4">
        <Button color="primary" variant="ghost" onClick={handleGoBack}>
          Back
        </Button>
      </div>
    </div>
  );
});

export default TicketDetails;

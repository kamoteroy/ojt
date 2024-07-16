import React, { useEffect, useState } from "react";
import { Button, Divider, Image, Input, Textarea } from "@nextui-org/react";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../shared/axiosInstance";
import TicketLineDetails from "./TicketLineDetails";

const TicketDetails = () => {
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
          `/getrecord/Ticket/Id/${ticketid}`
        );
        const dataArray = Array.isArray(userReponse.data)
          ? userReponse.data
          : [userReponse.data];

        const generatePromises = (dataArray, path, idKey) =>
          dataArray.map((item) =>
            axiosInstance.get(`/${path}/Id/${item[idKey]}`)
          );

        const userAssignedByPromises = generatePromises(
          dataArray,
          "getrecord/User",
          "AssignedBy"
        );
        const clientClientIdPromises = generatePromises(
          dataArray,
          "getrecord/Client",
          "ClientId"
        );
        const productProductIdPromises = generatePromises(
          dataArray,
          "getrecord/Product",
          "ProductId"
        );

        const [
          userAssignedByResponses,
          clientClientIdResponses,
          productProductIdResponses,
        ] = await Promise.all([
          Promise.all(userAssignedByPromises),
          Promise.all(clientClientIdPromises),
          Promise.all(productProductIdPromises),
        ]);

        const formattedClientData = [clientClientIdResponses[0].data].map(
          (item, index) => {
            const formatDate = (date) =>
              new Date(date).toISOString().slice(0, 10);

            const formattedDateBCSExpiry = formatDate(item.DateBCSExpiry);

            return {
              ...item,
              DateBCSExpiry: formattedDateBCSExpiry,
            };
          }
        );
        console.log("client", formattedClientData[0]);
        console.log("user", userAssignedByResponses[0].data);
        console.log("product", productProductIdResponses[0].data);

        const formattedData = dataArray.map((item, index) => {
          const formatDate = (date) =>
            new Date(date).toISOString().slice(0, 10);

          const formattedDateCreated = formatDate(item.DateCreated);

          return {
            ...item,
            DateCreated: formattedDateCreated,
            AssignedBy: `${userAssignedByResponses[index].data.Firstname} ${userAssignedByResponses[index].data.Lastname}`,
          };
        });
        console.log("Formatted Data:", formattedData);
        // Now you have responses from User, Client, and Product tables
        // You can process these responses as needed
        setDetails(formattedData[0]);
        setUsers(userAssignedByResponses[0].data);
        setClients(formattedClientData[0]);
        setProducts(productProductIdResponses[0].data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchData();
  }, []);

  const birthdate = new Date();
  const updatedDetails = {
    ...details,
    Birthdate: birthdate.toISOString().slice(0, 10),
  };
  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">
        Ticket Details
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-10">
        Ticket Number: {details.TicketNumber || ""}
      </div>
      <div className="flex flex-col md:flex-row gap-16">
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
            value={`${users.Firstname} ${users.Lastname}` || ""}
            readOnly
          />
          <Input
            type="text"
            label="Assigned To"
            value={details.AssignedBy || ""}
            readOnly
          />
        </div>
      </div>

      {/* Primary Information */}
      {/* <div className="flex flex-col md:flex-row gap-16">
        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6">
          <Input
            type="text"
            label="First Name"
            value={users.Firstname || ""}
            readOnly
          />
          <Input
            type="text"
            label="Middle Name"
            value={users.Middlename || ""}
            readOnly
          />
          <Input
            type="text"
            label="Last Name"
            value={users.Lastname || ""}
            readOnly
          />
        </div>
      </div> */}
      {/* <div className="flex-row pt-10 pb-3 uppercase font-bold">
        Ticket Information
      </div> */}
      <div className="flex flex-col pt-10 md:flex-row gap-4 ">
        <Input
          type="text"
          label="Caller"
          value={details.Caller || ""}
          readOnly
        />
        <Input
          type="text"
          label="Product"
          value={products.Name || ""}
          readOnly
        />
        <Input type="text" label="Client" value={clients.Name || ""} readOnly />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 pt-5">
        {/* <Textarea
          type="text"
          label="Concern"
          value={details.Concern || ""}
          // readOnly
        />
        <Textarea
          type="text"
          label="Solution"
          value={details.Solution || ""}
          // readOnly
        />
        <Textarea
          type="text"
          label="Remarks"
          // value={details.Remarks || ""}
          // readOnly
        /> */}
        <Input
          type="text"
          label="Concern"
          value={details.Concern || ""}
          // readOnly
        />
        <Input
          type="text"
          label="Solution"
          value={details.Solution || ""}
          // readOnly
        />
        <Input
          type="text"
          label="Remarks"
          value={details.Remarks || ""}
          // readOnly
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 pt-5">
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
        <Input
          type="text"
          label="Status"
          value={details.Status == 0 ? "Ongoing" : "Solved"}
          readOnly
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 pt-10 pb-10">
        <Input
          type="text"
          label="Reviewed By"
          // value={details.Category || ""}
          readOnly
        />
        <Input
          type="text"
          label="BCS Expiry"
          value={clients.DateBCSExpiry || ""}
          readOnly
        />
        {/* <Input
          type="text"
          label="Status"
          value={details.Status || ""}
          readOnly
        /> */}
      </div>
      <TicketLineDetails />
      <div className="pt-10 justify-end flex gap-4">
        <Button color="primary" variant="ghost" onClick={handleGoBack}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default TicketDetails;

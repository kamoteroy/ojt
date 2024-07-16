import React, { useEffect, useState, useRef } from "react";
import { Button, Divider, Input } from "@nextui-org/react";
import { useParams } from "react-router-dom";
import axiosInstance from "../shared/axiosInstance";
import ToasterUtils from "../shared/ToasterUtils.jsx";
import addAuditTrail from "../shared/RecordAudit.jsx";
import { useCurrentUser } from "../../auth/CurrentUserContext";

const ClientDetails = () => {
  const { clientId } = useParams();
  const [details, setDetails] = useState({});
  const { showMessage } = ToasterUtils();
  const { currentUserId } = useCurrentUser();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const fetchClientDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/getrecord/Client/Id/${clientId}`
        );
        setDetails(response.data);
      } catch (error) {
        showMessage("Error fetching:", "error");
      }
      await addAuditTrail(currentUserId, "ViewClient", clientId, "Client");
      showMessage("Record Viewed Successfully", "success");
    };
    fetchClientDetails();
  }, [clientId]);

  const handleGoBack = () => {
    window.history.back();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const calculateColor = (DateSoftwareAcceptance, DateBCSExpiry) => {
    const today = new Date();
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    const utc1 = Date.UTC(
      DateSoftwareAcceptance.getFullYear(),
      DateSoftwareAcceptance.getMonth(),
      DateSoftwareAcceptance.getDate()
    );
    const utc2 = Date.UTC(
      DateBCSExpiry.getFullYear(),
      DateBCSExpiry.getMonth(),
      DateBCSExpiry.getDate()
    );
    const diff = Math.floor((utc2 - utc1) / _MS_PER_DAY);

    if (diff > 30) {
      return "success"; // More than 1 month, green
    } else if (diff >= 0 && diff <= 30) {
      return "warning"; // 1 month or less, yellow
    } else {
      return "danger"; // Exceeds expiry, red
    }
  };

  const color = calculateColor(
    new Date(details.DateSoftwareAcceptance),
    new Date(details.DateBCSExpiry)
  );

  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">
        View Client
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        Client Information
      </div>
      Primary Information
      <div className="flex flex-col md:flex-row gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-3">
          <Input type="text" label="Name" value={details.Name || ""} readOnly />
          <Input
            type="text"
            label="Address"
            value={details.Address || ""}
            readOnly
          />
          <Input
            type="text"
            label="Email"
            value={details.Email || ""}
            readOnly
          />
          <Input
            type="text"
            label="Contact Person"
            value={details.ContactPerson || ""}
            readOnly
          />
          <Input
            type="text"
            label="Mobile Number"
            value={details.MobileNumber || ""}
            readOnly
          />
          <Input
            type="text"
            label="Landline Number"
            value={details.LandlineNumber || ""}
            readOnly
          />
          <Input
            type="date"
            label="Date Software Acceptance"
            value={formatDate(details.DateSoftwareAcceptance) || ""}
            color={color}
            readOnly
          />
          <Input
            type="date"
            label="Date BCS Expiry"
            value={formatDate(details.DateBCSExpiry) || ""}
            color={color}
            readOnly
          />
          <Input
            type="date"
            label="Date BCS Renewal"
            value={formatDate(details.DateBCSRenewal) || ""}
            readOnly
          />
        </div>
      </div>
      <div className="pt-10 justify-end flex gap-4">
        <Button color="primary" variant="ghost" onClick={handleGoBack}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default ClientDetails;

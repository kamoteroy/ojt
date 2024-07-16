import React, { useEffect, useState, useRef } from "react";
import { Button, Divider, Image, Input, Skeleton } from "@nextui-org/react";
import { BASE_URL } from "../../routes/BaseUrl";
import addAuditTrail from "../shared/RecordAudit";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../shared/axiosInstance";
import { useCurrentUser } from "../../auth/CurrentUserContext";

const UserDetails = () => {
  const { userId } = useParams();
  const [details, setDetails] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const isInitialRender = useRef(true);
  const { currentUserId } = useCurrentUser();
  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/getuserroledept/User/${userId}`
        );
        await addAuditTrail(currentUserId, "ViewUser", userId, "User");
        setDetails(response.data);

        setImageUrl(`${BASE_URL}/images/${response.data.Image}`);
        console.log(details);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchData();
  }, []);

  const birthdate = details?.Birthdate?.split("T")[0] || "";
  const updatedDetails = {
    ...details,
    Birthdate: birthdate,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white min-h-fit py-10 px-8">
      <div className="flex flex-row text-2xl font-bold uppercase">
        {`${details.Lastname || ""} Details`}
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        Primary Information
      </div>
      {/* Primary Information */}
      <div className="flex flex-col md:flex-row gap-16">
        <div className="relative flex flex-col gap-2 items-center justify-center">
          <Skeleton isLoaded={!showSkeleton} className="rounded-full">
            <div className="relative inline-block rounded-full overflow-hidden w-[200px] h-[200px]">
              <img
                alt="Error"
                src={
                  imageUrl
                    ? imageUrl
                    : "https://i.pravatar.cc/150?u=a04258114e29026708c"
                }
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.src =
                    "https://i.pravatar.cc/150?u=a04258114e29026708c";
                }}
              />
            </div>
          </Skeleton>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-3">
          <Input
            type="text"
            label="First Name"
            value={details.Firstname || ""}
            readOnly
          />
          <Input
            type="text"
            label="Middle Name"
            value={details.Middlename || ""}
            readOnly
          />
          <Input
            type="text"
            label="Last Name"
            value={details.Lastname || ""}
            readOnly
          />
          <Input
            type="text"
            label="Username"
            value={details.Username || ""}
            readOnly
          />
        </div>
      </div>
      <div className="flex-row pt-10 pb-3 uppercase font-bold">
        Additional Information
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          label="Contact #"
          value={details.ContactNumber || ""}
          readOnly
        />
        <Input
          type="text"
          label="Address"
          value={details.Address || ""}
          readOnly
        />
        <Input
          type="date"
          label="Date of Birth"
          value={updatedDetails.Birthdate || ""}
          readOnly
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 pt-10">
        <Input
          type="text"
          label="Gender"
          value={details.Gender || ""}
          readOnly
        />
        <Input
          type="text"
          label="Roles"
          value={details.RoleName || ""}
          readOnly
        />
        <Input
          type="text"
          label="Department"
          value={details.DepartmentName || ""}
          readOnly
        />
      </div>
      <div className="pt-10 justify-end flex gap-4">
        <Button color="primary" variant="ghost" onClick={handleGoBack}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default UserDetails;

import React, { useState, useEffect } from "react";
import axiosInstance from "../shared/axiosInstance";
import { TicketData } from "../../data/TicketData";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  CircularProgress,
} from "@nextui-org/react";
import { TicketIcon } from "../../icons/TicketIcon";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import Loading from "../shared/Loading";

const MyTicketOverview = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUserId } = useCurrentUser();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const response = await axiosInstance.get(
        `/getRecordCountById/Ticket/${currentUserId}`
      );
      console.log("my ticket response: ", response);
      setRecords(response.data.records);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return null;
  }

  const getStatusColor = (valueKey) => {
    return valueKey === "OngoingCount" ? "warning" : "success";
  };

  return (
    <>
      <div className="py-10">
        <p className="text-4xl font-bold">My Tickets</p>
        <Divider />
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        {records.map((record, index) => (
          <React.Fragment key={index}>
            <Card className="w-full">
              <CardHeader className="flex">
                <div className="flex flex-col md:flex-row">
                  <div className="flex flex-row gap-2 text-md font-bold uppercase">
                    <TicketIcon /> Tickets
                  </div>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row justify-start items-center gap-1">
                    <span className="font-bold text-2xl">
                      {record.totalTickets ?? 0}
                    </span>
                  </div>
                  <CircularProgress
                    size="lg"
                    value={100}
                    color="secondary"
                    showValueLabel={true}
                  />
                </div>
              </CardBody>
              <CardFooter>
                <span>Tickets Created</span>
              </CardFooter>
            </Card>
            {TicketData.map((item, index) => {
              // Calculate percentages
              const totalTickets = record[item.valueKey] ?? 0;
              const total = record.totalTickets ?? 0;
              const percentage = total
                ? ((totalTickets / total) * 100).toFixed(2)
                : 0;

              return (
                <Card className="w-full" key={index}>
                  <CardHeader className="flex">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex flex-row gap-2 text-md font-bold uppercase">
                        <TicketIcon /> Tickets
                      </div>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex flex-row justify-start items-center gap-1">
                        <span className="font-bold text-2xl">
                          {totalTickets}
                        </span>
                      </div>
                      <CircularProgress
                        size="lg"
                        value={percentage}
                        color={getStatusColor(item.valueKey)}
                        showValueLabel={true}
                      />
                    </div>
                  </CardBody>
                  <CardFooter>
                    <span>{item.title}</span>
                  </CardFooter>
                </Card>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export default MyTicketOverview;

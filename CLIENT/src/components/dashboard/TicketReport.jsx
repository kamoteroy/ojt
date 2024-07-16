import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../shared/axiosInstance";
import Loading from "../shared/Loading";

const TicketReport = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const response = await axiosInstance.get(`/getMonthlyRecordCount/Ticket`);
      console.log("response: ", response.data);

      // Sort records by year
      const sortedRecords = response.data
        .sort((a, b) => {
          const yearA = parseInt(a.monthYear.split(" ")[1]);
          const yearB = parseInt(b.monthYear.split(" ")[1]);
          return yearB - yearA;
        })
        .slice(0, 6);

      // Convert avgResolutionTime to numerical format
      const formattedRecords = sortedRecords.map((record) => ({
        ...record,
        avgResolutionDays: convertToDays(record.avgResolutionTime),
      }));

      setRecords(formattedRecords);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setLoading(false);
    }
  };

  // Function to convert time duration string to days
  const convertToDays = (timeString) => {
    const timeParts = timeString.split(", ");
    let totalDays = 0;
    timeParts.forEach((part) => {
      const value = parseInt(part.split(" ")[0]);
      if (part.includes("day")) {
        totalDays += value;
      } else if (part.includes("hour")) {
        totalDays += value / 24;
      } else if (part.includes("minute")) {
        totalDays += value / (24 * 60);
      }
    });
    return totalDays.toFixed(2);
  };
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return null;
  }

  return (
    <div className="col-span-7">
      <div className="py-10">
        <p className="text-4xl font-bold">Reports</p>
        <Divider />
      </div>
      <Card className="w-full">
        <CardHeader className="flex gap-3 flex-row justify-between">
          <div className="flex flex-col md:flex-row">
            <p className="text-md font-bold uppercase">Ticket Reports</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="h-fit w-full">
          <div className="flex flex-row justify-center">
            <ResponsiveContainer width="100%" height={300}>
              {records.length === 0 ? (
                <div className="flex flex-row justify-center items-center h-full">
                  <p className="text-red-500 fw-bold ">No Record Found</p>
                </div>
              ) : (
                <LineChart
                  data={records}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthYear" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalTickets"
                    name="Total Tickets"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ongoingCount"
                    name="Ongoing Tickets"
                    stroke="#82ca9d"
                  />
                  <Line
                    type="monotone"
                    dataKey="solvedCount"
                    name="Solved Tickets"
                    stroke="#ffc658"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgResolutionDays"
                    name="Avg Resolution Time (days)"
                    stroke="#ff7300"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
          <Divider />
          <div className="flex flex-row justify-center items-center gap-2 capitalize">
            <span> Reports last 6 months</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TicketReport;

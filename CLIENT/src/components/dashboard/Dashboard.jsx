import React from "react";
import TicketOverview from "./TicketOverview";
import CustomerReport from "./CustomerReport";
import TicketReport from "./TicketReport";
import MyTicketReport from "./MyTicketReport";
import { Divider } from "@nextui-org/react";
import MyTicketOverview from "./MyTicketOverview";
import MyCustomerReport from "./MyCustomerReport";
import { useSelector } from "react-redux";

/****************************************************************
 * STATUS               : Pending(layout only)
 * DATE CREATED/UPDATED : 02-22-2024
 * PURPOSE/DESCRIPTION  : Component of the dashboard page
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : Dashboard
 *****************************************************************/
const Dashboard = () => {
  const user = useSelector((state) => state.user.value);

  console.log(user);
  return (
    <>
      <MyTicketOverview />
      <TicketOverview />
      {/* My Reports */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-12">
        <div className="col-span-5">
          <div className="py-10">
            <p className="text-4xl font-bold">My Feedback</p>
            <Divider />
          </div>
          <MyCustomerReport />
        </div>
        <div className="col-span-7">
          <div className="py-10">
            <p className="text-4xl font-bold">My Reports</p>
            <Divider />
          </div>
          <MyTicketReport />
        </div>
      </div>
      {/* Global Report */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-12">
        <CustomerReport />
        <TicketReport />
      </div>
    </>
  );
};

export default Dashboard;

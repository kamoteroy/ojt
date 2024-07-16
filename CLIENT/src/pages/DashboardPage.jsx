import React from "react";
import Dashboard from "../components/dashboard/Dashboard";
import ParentPage from "../components/shared/ParentPage";

/****************************************************************
 * STATUS               : Pending(layout only)
 * DATE CREATED/UPDATED : 02-22-2024
 * PURPOSE/DESCRIPTION  : Landingpage after login
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : DashboardPage
 *****************************************************************/
const DashboardPage = () => {
  return (
    <ParentPage>
      <Dashboard />
    </ParentPage>
  );
};

export default DashboardPage;

import React from "react";
import RoleDetails from "../components/roles/RoleDetails";
import ParentPage from "../components/shared/ParentPage";

/****************************************************************
 * STATUS               : Pending(Layout only)
 * DATE CREATED/UPDATED : 03-23-2024
 * PURPOSE/DESCRIPTION  : List of roles in a table
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : RoleDetails
 *****************************************************************/
const RoleDetailsPage = () => {
  return (
    <>
      <ParentPage>
        <RoleDetails />
      </ParentPage>
    </>
  );
};

export default RoleDetailsPage;

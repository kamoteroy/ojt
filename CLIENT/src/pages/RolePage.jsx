import React from "react";
import RoleTable from "../components/roles/RoleTable";
import ParentPage from "../components/shared/ParentPage";

/****************************************************************
 * STATUS               : Pending(Layout only)
 * DATE CREATED/UPDATED : 03-23-2024
 * PURPOSE/DESCRIPTION  : List of roles in a table
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : RolePage
 *****************************************************************/
const RolePage = () => {
  return (
    <>
      <ParentPage>
        <RoleTable />
      </ParentPage>
    </>
  );
};

export default RolePage;

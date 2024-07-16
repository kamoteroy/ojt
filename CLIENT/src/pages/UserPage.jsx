import React from "react";
import Usertable from "../components/users/UserTable";
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
        <Usertable />
      </ParentPage>
    </>
  );
};

export default RolePage;

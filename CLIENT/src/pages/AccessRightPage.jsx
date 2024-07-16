import React from "react";
import AccessRightTable from "../components/accessright/AccessRightTable";
import ParentPage from "../components/shared/ParentPage";

/****************************************************************
 * STATUS               : Pending(Layout only)
 * DATE CREATED/UPDATED : 03-23-2024
 * PURPOSE/DESCRIPTION  : List of accessrights in a table
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : AccessRightPage
 *****************************************************************/
const AccessRightPage = () => {
  return (
    <>
      <ParentPage>
        <AccessRightTable />
      </ParentPage>
    </>
  );
};

export default AccessRightPage;

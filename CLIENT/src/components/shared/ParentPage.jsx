import React from "react";
import ParentInset from "./ParentInset";
import SideNav from "./SideNav";
import Nav from "./Nav";
import { NotificationProvider } from "../notification/NotificationContext";

/****************************************************************
 * STATUS               : Pending(Layout only)
 * DATE CREATED/UPDATED : 03-23-2024
 * PURPOSE/DESCRIPTION  : Recycable Parent Page to avoid redundancy
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : ParentPage
 *****************************************************************/
const ParentPage = ({ children }) => {
  return (
    <NotificationProvider>
      <div className="relative md:flex">
        <SideNav />
        <div className="flex-1">
          <Nav />
          <div className="container mx-auto p-10">
            <ParentInset>{children}</ParentInset>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default ParentPage;

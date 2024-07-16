import React from "react";
import TicketTable from "../components/tickets/TicketTable";
import ParentPage from "../components/shared/ParentPage";

function Tickets() {
  return (
    <ParentPage>
      <TicketTable />
    </ParentPage>
  );
}

export default Tickets;

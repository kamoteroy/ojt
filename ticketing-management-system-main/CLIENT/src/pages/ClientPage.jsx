import React from "react";
import ParentPage from "../components/shared/ParentPage";
import ClientTable from "../components/clients/ClientTable";

const ClientPage = () => {
  return (
    <ParentPage>
      <ClientTable />
    </ParentPage>
  );
};

export default ClientPage;

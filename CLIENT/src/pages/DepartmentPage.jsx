import React from "react";
import ParentPage from "../components/shared/ParentPage";
import DepartmentTable from "../components/departments/DepartmentTable";

function ProductPage() {
  return (
    <ParentPage>
      <DepartmentTable />
    </ParentPage>
  );
}

export default ProductPage;

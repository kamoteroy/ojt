import React from "react";
import ParentPage from "../components/shared/ParentPage";
import ProductTable from "../components/products/ProductTable";

function ProductPage() {
  return (
    <ParentPage>
      <ProductTable />
    </ParentPage>
  );
}

export default ProductPage;

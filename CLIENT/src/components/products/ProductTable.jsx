import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Tooltip,
  Link,
  Skeleton,
} from "@nextui-org/react";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { PlusIcon } from "../../icons/PlusIcon";
import { SearchIcon } from "../../icons/SearchIcon";
import { EditIcon } from "../../icons/EditIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { columns } from "../../data/ProductData";
import axiosInstance from "../shared/axiosInstance";
import { BASE_URL } from "../../routes/BaseUrl";

import ModalApp from "../shared/Modal";
import EditProduct from "./EditProductModal";
import AddProduct from "./AddProductModal";
import ViewProduct from "./ViewProductModal";
import addAuditTrail from "../shared/RecordAudit";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import ToasterUtils from "../shared/ToasterUtils";
import GetPermission from "../shared/GetPermission";
import UnAuthorizedPage from "../../pages/403Page";
import { useSelector } from "react-redux";

const INITIAL_VISIBLE_COLUMNS = [
  "Code",
  "Name",
  "Description",
  "Category",
  "Price",
  "actions",
];

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 03-23-2024
 * PURPOSE/DESCRIPTION  : Handles PRODUCT TABLE feature of products
 * PROGRAMMER           : Francis A. Cejudo
 * FUNCTION NAME        : ProductTable
 *****************************************************************/
const ProductTable = () => {
  const [filterValue, setFilterValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "Code",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [viewProductDetails, setViewProductDetails] = useState(null);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user.value);

  //permissions
  const permissions = user.permissions;
  const canAdd = permissions.includes("AddProduct");
  const canDelete = permissions.includes("DeleteProduct");
  const canView = permissions.includes("ViewProduct");
  const canEdit = permissions.includes("EditProduct");
  const isInitialRender = useRef(true);
  const fetchAllData = async () => {
    try {
      const [productResponse] = await Promise.all([
        axiosInstance.get(`${BASE_URL}/getcreatedupdatedby/Product`),
      ]);

      const products = productResponse.data;
      setProducts(products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const initializeDataFetch = async () => {
      try {
        await fetchAllData();
        await addAuditTrail(
          currentUserId,
          "ViewAllProduct",
          initializeDataFetch,
          "Product"
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    initializeDataFetch();
  }, []);

  const fetchSingleData = async (productId) => {
    if (productId) {
      try {
        const response = await axiosInstance.get(
          `/getrecord/Product/Id/${productId}`
        );
        setViewProductDetails(response.data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    }
  };

  const deleteData = async () => {
    try {
      const response = await axiosInstance.delete(
        `/deleterecord/Product/Id/${productIdToDelete}`
      );
      await addAuditTrail(
        currentUserId,
        "DeleteProduct",
        productIdToDelete,
        "Product"
      );
      fetchAllData();
      setDeleteModalOpen(false);
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
    }
  };

  const handleViewData = async (productId) => {
    try {
      await fetchSingleData(productId);
      setSelectedProductId(productId);
      setViewModalOpen(true);
      await addAuditTrail(currentUserId, "ViewProduct", productId, "Product");
    } catch (error) {
      console.error("Error handling edit product:", error);
    }
  };

  const handleEditData = async (productId) => {
    try {
      await fetchSingleData(productId);
      setSelectedProductId(productId);
      setEditModalOpen(true);
    } catch (error) {
      console.error("Error handling edit product:", error);
    }
  };

  const handleDeleteData = async (productId) => {
    try {
      setProductIdToDelete(productId);

      setDeleteModalOpen(true);
    } catch (error) {
      console.error("Error handling delete product:", error);
    }
  };

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredProducts = [...products];

    if (hasSearchFilter) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.Name.toLowerCase().includes(filterValue.toLowerCase()) ||
          product.Code.includes(filterValue)
      );
    }

    return filteredProducts;
  }, [products, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    const sortedData = [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedData.slice(start, end);
  }, [sortDescriptor, filteredItems, page, rowsPerPage]);

  const renderCell = React.useCallback((product, columnKey) => {
    const cellValue = product[columnKey];

    switch (columnKey) {
      case "Name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{cellValue}</p>
          </div>
        );
      case "Description":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "Category":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{cellValue}</p>
          </div>
        );
      case "Price":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );

      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit product">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="secondary"
                isDisabled={!canEdit}
                className={`text-lg text-default-400 cursor-pointer active:opacity-50`}
                onClick={() => {
                  handleEditData(product.Id);
                }}
              >
                <EditIcon />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Delete product">
              <Button
                size="sm"
                isIconOnly
                variant="flat"
                color="warning"
                isDisabled={!canDelete}
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDeleteData(product.Id)}
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-center">
          <Input
            isClearable
            className="w-full"
            placeholder="Search product name or code"
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
            size="sm"
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                  color="primary"
                  size="lg"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              endContent={<PlusIcon />}
              size="lg"
              onPress={() => setAddModalOpen(true)}
              isDisabled={!canAdd}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {products.length} products
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    products.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          key={pages}
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <UnAuthorizedPage />;
  }

  return (
    <>
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[400px]",
        }}
        selectedKeys={selectedKeys}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No products found"} items={sortedItems}>
          {(item) => (
            <TableRow
              key={item.Id}
              onClick={() => canView && handleViewData(item.Id)}
              className={`hover:bg-gray-200 ${
                canView ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            >
              {headerColumns.map((column) => (
                <TableCell key={`${item.Id}-${column.uid}`}>
                  {renderCell(item, column.uid)}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ModalApp
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
        content="Are you sure you want to delete this Product?"
        actionButtonLabel="Delete"
        actionButtonOnClick={deleteData}
        permission={!canDelete}
      />
      <AddProduct
        isOpen={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchAllData}
      />
      <EditProduct
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={fetchAllData}
        productId={selectedProductId}
        details={viewProductDetails}
      />
      <ViewProduct
        isOpen={viewModalOpen}
        onOpenChange={setViewModalOpen}
        productId={selectedProductId}
        details={viewProductDetails}
      />
    </>
  );
};

export default ProductTable;

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
  Chip,
  User,
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
import { EyeIcon } from "../../icons/EyeIcon";
import { columns } from "../../data/AccessRightData";
import { BASE_URL } from "../../routes/BaseUrl";
import ModalApp from "../shared/Modal";
import EditAccessRight from "./EditAccessRightModal";
import AddAccessRight from "./AddAccessRightModal";
import ViewAccessRight from "./ViewAccessRightModal";
import axiosInstance from "../shared/axiosInstance";
import GetPermission from "../shared/GetPermission";
import UnAuthorizedPage from "../../pages/403Page";
import addAuditTrail from "../shared/RecordAudit";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import ToasterUtils from "../shared/ToasterUtils";
import { useSelector } from "react-redux";

const INITIAL_VISIBLE_COLUMNS = ["Code", "Name", "Description"];

const AccessRightTable = () => {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "Name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [accessRights, setAccessRights] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [idToDelete, setIdToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const user = useSelector((state) => state.user.value);

  //permissions
  const permissions = user.permissions;
  const canAdd = permissions.includes("AddAccessRight");
  const canDelete = permissions.includes("DeleteAccessRight");
  const canView = permissions.includes("ViewAccessRight");
  const isInitialRender = useRef(true);

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
          "ViewAllAccessRight",
          initializeDataFetch,
          "AccessRight"
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    initializeDataFetch();
  }, []);

  const fetchAllData = async () => {
    try {
      const [response] = await Promise.all([
        axiosInstance.get(`${BASE_URL}/getcreatedupdatedby/AccessRight`),
      ]);

      const accessRights = response.data;
      setAccessRights(accessRights);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setError(error);
    }
  };

  const fetchSingleData = async (id) => {
    if (id) {
      try {
        const response = await axiosInstance.get(
          `/getrecord/AccessRight/Id/${id}`
        );
        setViewDetails(response.data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    }
  };

  const deleteData = async () => {
    try {
      const response = await axiosInstance.delete(
        `/deleterecord/AccessRight/Id/${idToDelete}`
      );
      await addAuditTrail(
        currentUserId,
        "DeleteAccessRight",
        idToDelete,
        "AccessRight"
      );
      fetchAllData();
      setDeleteModalOpen(false);
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
    }
  };

  const handleViewData = async (id) => {
    try {
      await fetchSingleData(id);
      setSelectedId(id);
      setViewModalOpen(true);
      await addAuditTrail(currentUserId, "ViewAccessRight", id, "AccessRight");
    } catch (error) {
      console.error("Error handling edit data:", error);
    }
  };

  const handleEditData = async (id) => {
    try {
      await fetchSingleData(id);
      setSelectedId(id);
      setEditModalOpen(true);
    } catch (error) {
      console.error("Error handling edit data:", error);
    }
  };

  const handleDeleteData = async (id) => {
    try {
      setIdToDelete(id);
      setDeleteModalOpen(true);
    } catch (error) {
      console.error("Error handling delete data:", error);
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
    let filteredData = [...accessRights];

    if (hasSearchFilter) {
      filteredData = filteredData.filter(
        (data) =>
          data.Name.toLowerCase().includes(filterValue.toLowerCase()) ||
          data.Code.includes(filterValue)
      );
    }

    return filteredData;
  }, [accessRights, filterValue, statusFilter]);

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

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];

    switch (columnKey) {
      case "Name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "Description":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "actions":
        return <div className="relative flex items-center gap-2"></div>;
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
            placeholder="Search by Name or Code"
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
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {accessRights.length} Access Rights
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="8">8</option>
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
    accessRights.length,
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
        <TableBody emptyContent={"No accessRights found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.Id} className={`hover:bg-gray-200`}>
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
        title="Delete Access Right"
        content="Are you sure you want to delete this access right?"
        actionButtonLabel="Delete"
        actionButtonOnClick={deleteData}
        permission={!canDelete}
      />
      <AddAccessRight
        isOpen={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchAllData}
      />
      <EditAccessRight
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={fetchAllData}
        id={selectedId}
        details={viewDetails}
      />
      <ViewAccessRight
        isOpen={viewModalOpen}
        onOpenChange={setViewModalOpen}
        id={selectedId}
        details={viewDetails}
      />
    </>
  );
};

export default AccessRightTable;

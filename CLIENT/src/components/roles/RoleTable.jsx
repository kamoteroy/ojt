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
import { columns } from "../../data/RoleData";
import { BASE_URL } from "../../routes/BaseUrl";
import ModalApp from "../shared/Modal";
import EditRole from "./EditRoleModal";
import AddRole from "./AddRoleModal";
import ViewRole from "./ViewRoleModal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../shared/axiosInstance";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import GetPermission from "../shared/GetPermission";
import UnAuthorizedPage from "../../pages/403Page";

const INITIAL_VISIBLE_COLUMNS = [
  "Code",
  "Name",
  "CreatedByUsername",
  "UpdatedByUsername",
  "actions",
  "Description",
];

const RoleTable = () => {
  const [filterValue, setFilterValue] = useState("");
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
  const [roles, setRoles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [idToDelete, setIdToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isInitialRender = useRef(true);

  //permissions
  const permissions = GetPermission() || [];
  console.log("permissions: ", permissions);
  const canAdd = permissions.includes("AddRole");
  const canDelete = permissions.includes("DeleteRole");
  const canView = permissions.includes("ViewRole");

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
          "ViewAllRole",
          initializeDataFetch,
          "Role"
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
        axiosInstance.get(`${BASE_URL}/getcreatedupdatedby/Role`),
      ]);

      const roles = response.data;
      setRoles(roles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setLoading(false);
    }
  };

  const fetchSingleData = async (id) => {
    if (id) {
      try {
        const response = await axiosInstance.get(`/getrecord/Role/Id/${id}`);
        setViewDetails(response.data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    }
  };

  const deleteData = async () => {
    try {
      const response = await axiosInstance.delete(
        `/deleterecord/Role/Id/${idToDelete}`
      );
      await addAuditTrail(currentUserId, "DeleteRole", idToDelete, "Role");
      fetchAllData();
      setDeleteModalOpen(false);
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
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
    let filteredData = [...roles];

    if (hasSearchFilter) {
      filteredData = filteredData.filter(
        (data) =>
          data.Name.toLowerCase().includes(filterValue.toLowerCase()) ||
          data.Code.includes(filterValue)
      );
    }

    return filteredData;
  }, [roles, filterValue, statusFilter]);

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
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit role">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="secondary"
                className={`text-lg text-default-400 cursor-pointer active:opacity-50`}
                onClick={() => {
                  handleEditData(data.Id);
                }}
              >
                <EditIcon />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Delete role">
              <Button
                size="sm"
                isIconOnly
                variant="flat"
                color="warning"
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDeleteData(data.Id)}
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
            placeholder="Search by Role Name or Code"
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
            Total {roles.length} roles
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
    roles.length,
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
        <TableBody emptyContent={"No roles found"} items={sortedItems}>
          {(item) => (
            <TableRow
              className={`hover:bg-gray-200 ${
                canView ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              key={item.Id}
              onClick={() =>
                canView && navigate(`/roles/roledetails/${item.Id}`)
              }
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
        title="Delete Role"
        content="Are you sure you want to delete this Role?"
        actionButtonLabel="Delete"
        actionButtonOnClick={deleteData}
        permission={!canDelete}
      />
      <AddRole
        isOpen={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchAllData}
      />
      <EditRole
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={fetchAllData}
        id={selectedId}
        details={viewDetails}
      />
      <ViewRole
        isOpen={viewModalOpen}
        onOpenChange={setViewModalOpen}
        id={selectedId}
        details={viewDetails}
      />
    </>
  );
};

export default RoleTable;

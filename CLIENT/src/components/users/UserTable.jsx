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
  Skeleton,
} from "@nextui-org/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { PlusIcon } from "../../icons/PlusIcon";
import { SearchIcon } from "../../icons/SearchIcon";
import { EditIcon } from "../../icons/EditIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import {
  columns,
  statusOptions,
  statusColorMap,
  INITIAL_VISIBLE_COLUMNS,
} from "../../data/UserData";
import ModalApp from "../shared/Modal";
import axiosInstance from "../shared/axiosInstance";
import { filterItems } from "../helpers/FilterHelpers";
import { paginateItems, SortItems } from "../helpers/PaginationHelpers";
import Unauthorized from "../../pages/403Page";
import ToasterUtils from "../shared/ToasterUtils";
import addAuditTrail from "../shared/RecordAudit";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../routes/breadcrumb";

const UserTable = () => {
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
  const [data, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showMessage } = ToasterUtils();
  const { currentUserId } = useCurrentUser();
  const isInitialRender = useRef(true);
  const user = useSelector((state) => state.user.value);

  //permissions
  const permissions = user.permissions;
  const canAddUser = permissions.includes("AddUser");
  const canDeleteUser = permissions.includes("DeleteUser");
  const canViewUser = permissions.includes("ViewUser");

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const fetchData = async () => {
      try {
        const userReponse = await axiosInstance.get(`/getuserleftrole/User`);
        //console.log("LEFT JOIN", userReponse.data);
        setUsers(userReponse.data);
        setLoading(false);
        await addAuditTrail(currentUserId, "ViewUser", fetchData, "User");
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    setUserIdToDelete(userId);
    setModalOpen(true);
  };

  const deleteUser = async () => {
    try {
      const response = await axiosInstance.delete(
        `/deleterecord/User/Id/${userIdToDelete}`
      );
      const userReponse = await axiosInstance.get(`/getuserleftrole/User`);
      setUsers(userReponse.data);
      setModalOpen(false);
      await addAuditTrail(currentUserId, "DeleteUser", userIdToDelete, "User");
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
    }
  };

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  //FilterHelper
  const filteredItems = React.useMemo(() => {
    return filterItems(data, filterValue, statusFilter, statusOptions);
  }, [data, filterValue, statusFilter, statusOptions]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  //PaginationHelper
  const items = React.useMemo(() => {
    return paginateItems(page, rowsPerPage, filteredItems);
  }, [page, filteredItems, rowsPerPage]);
  //Sort Filters in PaginationHelper
  const sortedItems = React.useMemo(() => {
    return SortItems(page, rowsPerPage, filteredItems, sortDescriptor);
  }, [sortDescriptor, filteredItems, page, rowsPerPage]);

  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "Username":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "Firstname":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {cellValue}{" "}
              <span className="text-default-600">{user.Lastname}</span>
            </p>
          </div>
        );
      case "Role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">
              {user.Role}
            </p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={
              statusColorMap[user.isDeactivated == 0 ? "active" : "disabled"]
            }
            size="sm"
            variant="flat"
          >
            {user.isDeactivated == 0 ? "active" : "disabled"}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip color="danger" content="Delete user">
              <Button
                size="sm"
                isIconOnly
                variant="flat"
                color="warning"
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={(e) => {
                  handleDeleteUser(user.Id);
                  e.stopPropagation();
                }}
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
    const totalFilteredUsers = filteredItems.length;
    return (
      <>
        <Breadcrumbs />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-3 items-center">
            <Input
              isClearable
              className="w-full"
              placeholder="Search by Username"
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
                    Status
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {statusOptions.map((status) => (
                    <DropdownItem key={status.uid} className="capitalize">
                      {status.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
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
                onClick={() => navigate("/users/addusers")}
                isDisabled={!canAddUser}
              >
                Add New
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-default-400 text-small">
              Total {totalFilteredUsers} users
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
      </>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    data.length,
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
    return <Unauthorized />;
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
        <TableBody emptyContent={<Skeleton />} items={sortedItems}>
          {(item) => (
            <TableRow
              key={item.Id}
              className={`hover:bg-gray-200 ${
                canViewUser ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              onClick={() =>
                canViewUser && navigate(`/users/editusers/${item.Id}`)
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
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete User"
        content="Are you sure you want to delete this user?"
        actionButtonLabel="Confirm"
        actionButtonOnClick={deleteUser}
        permission={!canDeleteUser}
      />
    </>
  );
};

export default UserTable;

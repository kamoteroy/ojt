import React, { useEffect, useState } from "react";
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
  Checkbox,
} from "@nextui-org/react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { PlusIcon } from "../../icons/PlusIcon";
import { SearchIcon } from "../../icons/SearchIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { EyeIcon } from "../../icons/EyeIcon";
import { columns, statusOptions } from "../../data/NotificationData";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import ModalApp from "../shared/Modal";
import axiosInstance from "../shared/axiosInstance";
import Loading from "../shared/Loading";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import localforage from "localforage";
import ToasterUtils from "../shared/ToasterUtils";
import { EnvelopeClose } from "../../icons/EnvelopeClose";
import { EnvelopeOpen } from "../../icons/EnvelopeOpen";
import { useNotification } from "./NotificationContext";
import { formatAMPM, formatDate } from "../shared/FormatDate";

const statusColorMap = {
  read: "success",
  unread: "danger",
};

const INITIAL_VISIBLE_COLUMNS = ["Description", "DateCreated", "actions"];
const NotificationDetails = () => {
  const { setUnreadCount } = useNotification();
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "DateCreated",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const [notification, setNotification] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [notificationIdToDelete, setNotificationIdToDelete] = useState(null);
  const [deleteSelectedRowsModalOpen, setDeleteSelectedRowsModalOpen] =
    useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const initializeDataFetch = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    initializeDataFetch();
  }, []);

  const fetchData = async () => {
    try {
      const [notifResponse] = await Promise.all([
        await axiosInstance.get(
          `/getnotification/Notification/${currentUserId}`
        ),
      ]);
      const notifData = notifResponse.data;
      if (notifData.length === 0) {
        setNotification([]);
      } else {
        setNotification(notifResponse.data);
      }
      const unreadCount = notifData.filter(
        (notif) => notif.Status === 0
      ).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSelectAllRows = async () => {
    if (selectAllChecked) {
      setSelectedKeys(new Set());
    } else {
      const allIds = notification.map((notif) => notif.Id);
      setSelectedKeys(new Set(allIds));
    }
    setSelectAllChecked(!selectAllChecked);
    await fetchData();
  };
  const showDeleteButton = selectedKeys.size > 0;

  const handleDeleteNotification = async (notifId) => {
    setNotificationIdToDelete(notifId);
    setModalOpen(true);
  };
  const handleDeleteSelectedRows = () => {
    setDeleteSelectedRowsModalOpen(true);
  };
  const deleteNotification = async () => {
    try {
      await axiosInstance.delete(
        `/deleterecord/Notification/Id/${notificationIdToDelete}`
      );
      showMessage("Successfully Deleted Notification", "success");
      await fetchData();

      setModalOpen(false);
    } catch (error) {
      showMessage("Failed to Delete Notification", "error");
      console.error("Error deleting notification:", error);
    }
  };

  const handleStatusNotification = async (notificationId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await axiosInstance.put(
        `/updaterecord/Notification/Id/${notificationId}`,
        {
          Status: newStatus,
        }
      );

      await fetchData();
    } catch (error) {
      console.error("Error viewing notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notification.map((notif) => handleStatusNotification(notif.Id, 0))
      );
      showMessage("Marked all as Read", "success");
      setUnreadCount(0);
      await fetchData();
    } catch (error) {
      showMessage("Failed to Mark all as Read", "error");
      console.error("Error marking all notifications as read:", error);
    }
  };

  // const handleSelectRow = async (notificationId) => {
  //   setSelectedKeys((prevSelectedKeys) => {
  //     const newSelectedKeys = new Set(prevSelectedKeys);
  //     if (newSelectedKeys.has(notificationId)) {
  //       newSelectedKeys.delete(notificationId);
  //     } else {
  //       newSelectedKeys.add(notificationId);
  //     }
  //     return newSelectedKeys;
  //   });
  //   const notifResponse = await axiosInstance.get(
  //     `/getnotification/Notification/${currentUserId}`
  //   );
  //   setNotification(notifResponse.data);
  // };
  const handleSelectRow = async (notificationId) => {
    if (notificationId === "all") {
      handleSelectAllRows();
    } else {
      setSelectedKeys((prevSelectedKeys) => {
        const newSelectedKeys = new Set(prevSelectedKeys);
        if (newSelectedKeys.has(notificationId)) {
          newSelectedKeys.delete(notificationId);
        } else {
          newSelectedKeys.add(notificationId);
        }
        return newSelectedKeys;
      });
    }
    await fetchData();
  };

  const deleteSelectedRows = async () => {
    try {
      await Promise.all(
        Array.from(selectedKeys).map((notifId) =>
          axiosInstance.delete(`/deleterecord/Notification/Id/${notifId}`)
        )
      );
      showMessage("Successfully Deleted Notification", "success");
      await fetchData();

      setDeleteSelectedRowsModalOpen(false);
      setSelectedKeys(new Set());
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
      console.error("Error deleting notifications:", error);
    }
  };
  // const clearSelection = async () => {
  //   setSelectedKeys(new Set());
  //   const notifResponse = await axiosInstance.get(
  //     `/getnotification/Notification/${currentUserId}`
  //   );
  //   setNotification(notifResponse.data);
  // };

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredNotification = [...notification];

    if (hasSearchFilter) {
      filteredNotification = filteredNotification.filter(
        (notification) =>
          notification.Firstname.toLowerCase().includes(
            filterValue.toLowerCase()
          ) ||
          notification.Description.toLowerCase().includes(
            filterValue.toLowerCase()
          )
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredNotification = filteredNotification.filter((notification) =>
        Array.from(statusFilter).includes(
          notification.Status === 0 ? "unread" : "read"
        )
      );
    }

    return filteredNotification;
  }, [notification, filterValue, statusFilter]);

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
  const renderCell = React.useCallback(
    (notification, columnKey) => {
      const cellValue = notification[columnKey];

      switch (columnKey) {
        case "Checkbox":
          if (visibleColumns.has("Checkbox")) {
            return (
              <Checkbox
                isSelected={selectedKeys.has(notification.Id)}
                onValueChange={() => handleSelectRow(notification.Id)}
              />
            );
          }
          return null;
        case "Firstname":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {cellValue},{" "}
                <span className="text-default-600">
                  {notification.Lastname}
                </span>
              </p>
            </div>
          );
        case "Description":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{cellValue}</p>
            </div>
          );
        case "DateCreated":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {formatDate(cellValue)} | {formatAMPM(cellValue)}
              </p>
            </div>
          );
        case "Status":
          return (
            <Chip
              className="capitalize"
              color={
                statusColorMap[notification.Status == 0 ? "unread" : "read"]
              }
              size="sm"
              variant="flat"
            >
              {notification.Status == 0 ? "unread" : "read"}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip
                content={
                  notification.Status ? "Mark as Unread" : "Mark as Read"
                }
              >
                <button
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={(e) => {
                    handleStatusNotification(
                      notification.Id,
                      notification.Status
                    );
                    e.stopPropagation();
                  }}
                >
                  {notification.Status ? <EnvelopeOpen /> : <EnvelopeClose />}
                </button>
              </Tooltip>
              <Tooltip color="danger" content="Delete notification">
                <button
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                  onClick={(e) =>
                    handleDeleteNotification(
                      notification.Id,
                      e.stopPropagation()
                    )
                  }
                >
                  <DeleteIcon />
                </button>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [selectedKeys, visibleColumns]
  );

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
  const isAllRead = notification.every((notif) => notif.Status === 1);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-center">
          <Input
            isClearable
            className="w-full"
            placeholder="Search by Name"
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
              size="lg"
              onClick={() => handleMarkAllAsRead()}
              isDisabled={notification.length <= 0 || isAllRead ? true : false}
            >
              Mark all as Read
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {notification.length} notifications
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
    isAllRead,
    onRowsPerPageChange,
    notification.length,
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

  return (
    <>
      <div className="flex gap-4 items-center mb-4">
        <div className="flex justify-between gap-3 items-center">
          {notification.length > 0 && visibleColumns.has("Checkbox") && (
            <Button
              color="primary"
              size="lg"
              onClick={() => handleSelectAllRows()}
            >
              {`${!selectAllChecked ? "Select All" : "Select None"}`}
            </Button>
          )}
          {showDeleteButton && visibleColumns.has("Checkbox") && (
            <div>
              <Button
                color="danger"
                size="lg"
                onClick={handleDeleteSelectedRows}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>
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
        <TableBody emptyContent={"No Notification Found"} items={sortedItems}>
          {(item) => (
            <TableRow
              key={item.Id}
              className={`cursor-pointer ${
                item.Status === 0
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "hover:bg-gray-300"
              }`}
              onClick={async () => {
                await handleStatusNotification(item.Id, 0);
                navigate(item.LinkedComponent);
              }}
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
        content="Are you sure you want to delete this notification?"
        actionButtonLabel="Confirm"
        actionButtonOnClick={deleteNotification}
      />
      <ModalApp
        isOpen={deleteSelectedRowsModalOpen}
        onOpenChange={setDeleteSelectedRowsModalOpen}
        onClose={() => setDeleteSelectedRowsModalOpen(false)}
        title="Delete Selected Rows"
        content="Are you sure you want to delete the selected notifications?"
        actionButtonLabel="Confirm"
        actionButtonOnClick={deleteSelectedRows}
      />
      ;
    </>
  );
};

export default NotificationDetails;

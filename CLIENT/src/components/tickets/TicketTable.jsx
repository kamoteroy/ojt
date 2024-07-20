import React, { useEffect, useState, useRef } from "react";
import ReactToPrint, { useReactToPrint } from "react-to-print";
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
  user,
  Skeleton,
} from "@nextui-org/react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { PlusIcon } from "../../icons/PlusIcon";
import { SearchIcon } from "../../icons/SearchIcon";
import { EditIcon } from "../../icons/EditIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { EyeIcon } from "../../icons/EyeIcon";
import { PrintIcon } from "../../icons/PrintIcon";
import { IconCircle } from "../../icons/IconCircle";

import { columns, statusOptions, ticketCategory } from "../../data/TicketsData";
import { BASE_URL } from "../../routes/BaseUrl";
import axios from "axios";
import ModalApp from "../shared/Modal";
import axiosInstance from "../shared/axiosInstance";
import { useCurrentUser } from "../../auth/CurrentUserContext";
// import TicketDetails from "./TicketDetails";

import { formatDate, formatAMPM } from "../shared/FormatDate";
import ReviewIcon from "../../icons/ReviewIcon";
import TicketDetails from "./TicketDetails";
import SamplePrint from "./SamplePrint";

import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";
import TicketReview from "./TicketReview";
import GetPermission from "../shared/GetPermission";
import UnAuthorizedPage from "../../pages/403Page";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../routes/breadcrumb";

const statusColorMap = {
  solved: "success",
  ongoing: "danger",
};

const INITIAL_VISIBLE_COLUMNS = [
  "DateCreated",
  "ExpirationStatus",
  "TicketNumber",
  "ClientName",
  /* "Caller",
  "Concern", */
  "Status",
  "Actions",
  "DateBCSExpiry",
];
const TicketTable = () => {
  const { showMessage } = ToasterUtils();
  const navigate = useNavigate();
  const { currentUserId } = useCurrentUser();
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
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
  const [tickets, setTickets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(new Set(["All"]));
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const { ticketid } = useParams;
  const isInitialRender = useRef(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user.value);

  //permissions
  const permissions = user.permissions;
  const canAdd = permissions.includes("AddTicket");
  const canDelete = permissions.includes("DeleteTicket");
  const canView = permissions.includes("ViewTicket");

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const fetchData = async () => {
      try {
        const userReponse = await axiosInstance.get(
          `/getticketclientuserproduct/Ticket`
        );
        console.log("userresponsecheck", userReponse);
        /* const userAssignedByPromises = userReponse.data.map((item) =>
          axiosInstance.get(`/getrecord/User/Id/${item.AssignedBy}`)
        );
        const userAssignedByResponses = await Promise.all(
          userAssignedByPromises
        ); */

        const formattedData = userReponse.data.map((item, index) => {
          const formattedDateCreated = `${formatDate(
            item.DateCreated[0]
          )} ${formatAMPM(item.DateCreated[0])}`;
          const formattedDateCreatedCheck = formatDate(item.DateCreated[0]);
          const formattedDateUpdated = formatDate(item.DateUpdated[0]);
          const formattedDoneDate = formatDate(item.DoneDate);
          const formattedDateBCSExpiry = formatDate(item.DateBCSExpiry);
          const formattedAssignedBy = item.AssignedBy[1];

          return {
            ...item,
            DoneDate: formattedDoneDate,
            DateCreated: formattedDateCreated,
            DateCreatedCheck: formattedDateCreatedCheck,
            DateUpdated: formattedDateUpdated,
            DateBCSExpiry: formattedDateBCSExpiry,
            AssignedBy: formattedAssignedBy,
            ClientName: item.Name[1],
            Product: item.Name[0],
          };
        });

        console.log("LEFT JOIN", formattedData);
        setTickets(formattedData);

        await addAuditTrail(
          currentUserId,
          "ViewAllTicket",
          fetchData,
          "Ticket"
        );
        setLoading(false);
        /* showMessage(`Table Viewed Successfully`, "success"); */
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        setError(error);
      }
    };

    fetchData();
  }, []);

  const handleDeleteTicket = async (ticketId) => {
    setTicketToDelete(ticketId);
    setModalOpen(true);
  };

  function isExpiredByOneMonth(givenDateString) {
    // Convert date strings to Date objects
    const givenDate = new Date(givenDateString);
    const currentDate = new Date();

    // Calculate the difference in months between the current date and the given date
    const diffYears = currentDate.getFullYear() - givenDate.getFullYear();
    const diffMonths =
      diffYears * 12 + currentDate.getMonth() - givenDate.getMonth();

    // Check if the difference is greater than or equal to 1 month
    return diffMonths >= 1;
  }

  function isExpiredAtLeastOneMonth(givenDateString) {
    // Convert date strings to Date objects
    const givenDate = new Date(givenDateString);
    const currentDate = new Date();

    // Calculate the difference in milliseconds between the current date and the given date
    const diffTime = Math.abs(currentDate - givenDate);

    // Convert the difference in milliseconds to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if the difference is greater than or equal to 30 days
    const isAtLeast30Days = diffDays >= 30;

    // Check if the difference is greater than or equal to 31 days
    const isAtLeast31Days = diffDays >= 31;

    // Return true if the difference is at least 30 or 31 days
    return isAtLeast30Days || isAtLeast31Days;
  }
  const handleDeleteUser = async (userId) => {
    setUserIdToDelete(userId);
    setModalOpen(true);
  };

  const deleteTicket = async () => {
    try {
      const responseTicketID = await axiosInstance.get(
        `/getrecord/TicketReview/TicketId/${ticketToDelete}`
      );
      console.log("responseTicketID", responseTicketID);

      const responseUpdateAttachment = await axiosInstance.put(
        `/updaterecord/Attachment/TicketReviewId/${responseTicketID.data.Id}`,
        { TicketReviewId: null }
      );
      console.log("responseUpdateAttachment", responseUpdateAttachment);

      await axiosInstance.delete(`/deleterecord/Ticket/Id/${ticketToDelete}`);
      const userReponse = await axiosInstance.get(
        `/getticketclientuserproduct/Ticket`
      );
      await addAuditTrail(
        currentUserId,
        "DeleteTicket",
        ticketToDelete,
        "Ticket"
      );
      showMessage(`Ticket Deleted Successfully`, "success");
      const formattedData = userReponse.data.map((item, index) => {
        const formattedDateCreated = `${formatDate(
          item.DateCreated[0]
        )} ${formatAMPM(item.DateCreated[0])}`;
        const formattedDateCreatedCheck = formatDate(item.DateCreated[0]);
        const formattedDateUpdated = formatDate(item.DateUpdated[0]);
        const formattedDoneDate = formatDate(item.DoneDate);
        const formattedDateBCSExpiry = formatDate(item.DateBCSExpiry);
        const formattedAssignedBy = item.AssignedBy[1];

        return {
          ...item,
          DoneDate: formattedDoneDate,
          DateCreated: formattedDateCreated,
          DateCreatedCheck: formattedDateCreatedCheck,
          DateUpdated: formattedDateUpdated,
          DateBCSExpiry: formattedDateBCSExpiry,
          AssignedBy: formattedAssignedBy,
          ClientName: item.Name[1],
          Product: item.Name[0],
        };
      });

      setTickets(formattedData);
      setModalOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
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
    let filteredTickets = [...tickets];

    if (hasSearchFilter) {
      filteredTickets = filteredTickets.filter((ticket) =>
        ticket.Caller.toLowerCase().includes(filterValue.toLowerCase())
      );
      console.log("has search filter", filteredTickets);
    }

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredTickets = filteredTickets.filter((ticket) =>
        Array.from(statusFilter).includes(
          ticket.Status === 0 ? "ongoing" : "solved"
        )
      );
    }

    /* if (categoryFilter.has("All")) {
      filteredTickets = [...tickets];
    } else {
      // Filter tickets based on categoryFilter
      filteredTickets = filteredTickets.filter((ticket) =>
        categoryFilter.has(ticket.Category[0])
      );
    } */

    if (!categoryFilter.has("All")) {
      // Filter tickets based on categoryFilter
      filteredTickets = filteredTickets.filter((ticket) =>
        categoryFilter.has(ticket.Category[0])
      );
    }

    if (fromDate && toDate) {
      filteredTickets = filteredTickets.filter((ticket) => {
        const ticketDate = new Date(ticket.DateCreatedCheck);
        const formattedDate = ticketDate.toISOString().split("T")[0];
        console.log("formattedDate", formattedDate);
        return formattedDate >= fromDate && formattedDate <= toDate;
      });
      console.log("fromDate, toDate", fromDate, toDate);
      console.log("fileterd tickets", filteredTickets);
    }

    return filteredTickets;
  }, [tickets, filterValue, statusFilter, fromDate, toDate, categoryFilter]);

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

  const componentRef = React.useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // const handlePrint = () => {};
  // <ReactToPrint
  //   trigger={() => {
  //     return <button>Print</button>;
  //   }}
  //   content={() => this.componentRef}
  //   documentTitle="Sample Print"
  //   pageStyle="print"
  // />;

  const renderCell = React.useCallback((tickets, columnKey) => {
    const cellValue = tickets[columnKey];

    switch (columnKey) {
      case "DateCreated":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );

      case "TicketNumber":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize ">{cellValue}</p>
          </div>
        );

      case "ClientName": //ilisan ug client name
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );

      case "Product":
        return (
          <div>
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{cellValue}</p>
            </div>
          </div>
        );

      case "Role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">
              {tickets.Role}
            </p>
          </div>
        );

      case "Status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[tickets.Status == 0 ? "ongoing" : "solved"]}
            size="sm"
            variant="flat"
          >
            {tickets.Status == 0 ? "ongoing" : "solved"}
          </Chip>
        );

      case "Category":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {tickets.Category[0]}
            </p>
          </div>
        );

      case "Severity":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );

      case "AssignedBy":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );

      case "DateBCSExpiry":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );

      case "ExpirationStatus":
        return (
          <div className="flex flex-col">
            <IconCircle
              color={
                isExpiredAtLeastOneMonth(tickets.DateBCSExpiry)
                  ? "red"
                  : "green"
              }
            />
          </div>
        );
      case "Actions":
        return (
          <div className="relative flex items-center gap-2">
            {/*  <Tooltip content="Review Ticket">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                className={`text-lg text-default-400 cursor-pointer active:opacity-50`}
                onClick={() =>
                  navigate(`/tickets/ticketreview/${tickets.Id[0]}`)
                }
              >
                <ReviewIcon />
              </Button>
            </Tooltip> */}
            {
              <Tooltip color="danger" content="Delete Ticket">
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  isDisabled={!canDelete}
                  className={`text-lg text-default-400 cursor-pointer active:opacity-50`}
                  onClick={() => handleDeleteTicket(tickets.Id[0])}
                >
                  <DeleteIcon />
                </Button>
              </Tooltip>
            }
            {/* <div onClick={handlePrint}>
              <Tooltip content="Print">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  className={`text-lg text-default-400 cursor-pointer active:opacity-50`}
                  // size="lg"
                  // onClick={() => handlePrint}
                >
                  <PrintIcon />
                  <div style={{ display: "none" }}>
                    <SamplePrint ref={componentRef} />
                  </div>
                </Button>
              </Tooltip>
            </div>
            <Button
              isIconOnly
              onClick={handlePrint}
              size="sm"
              variant="flat"
              color="primary"
              className={`text-lg text-default-400 cursor-pointer active:opacity-50`}
            >
              <PrintIcon />
            </Button>
            <div style={{ display: "none" }}>
              <SamplePrint ref={componentRef} />
            </div> */}
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
      <>
        <Breadcrumbs />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-3 items-center">
            <Input
              isClearable
              className="w-full"
              placeholder="Search by Caller"
              startContent={<SearchIcon />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
              size="sm"
            />
            {/* Date filter */}
            <div className="flex gap-3">
              <Input
                type="date"
                label="From"
                placeholder="From"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                }}
              />
              <Input
                type="date"
                label="To"
                placeholder="To"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                }}
              />
            </div>

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
                    Category
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={categoryFilter}
                  selectionMode="multiple"
                  onSelectionChange={setCategoryFilter}
                >
                  {ticketCategory.map((category) => (
                    <DropdownItem key={category.value} className="capitalize">
                      {category.name}
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
                    <DropdownItem
                      key={column.uid}
                      textValue={column.uid}
                      className="capitalize"
                    >
                      {column.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Button
                color="primary"
                endContent={<PlusIcon />}
                size="lg"
                onClick={() => navigate("/tickets/addtickets")}
                isDisabled={!canAdd}
              >
                Add New
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-default-400 text-small">
              Total {filteredItems.length} tickets
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
    categoryFilter,
    visibleColumns,
    onRowsPerPageChange,
    tickets.length,
    onSearchChange,
    hasSearchFilter,
    fromDate,
    toDate,
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
        <TableBody emptyContent={"No tickets found"} items={sortedItems}>
          {(item) => (
            <TableRow
              key={item.Id}
              /* className={`hover:bg-gray-200 cursor-pointer ${
                isExpiredAtLeastOneMonth(item.DateBCSExpiry) ? "bg-warning" : ""
              }`} */
              className={`hover:bg-gray-200 ${
                canView ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              onClick={
                () =>
                  canView &&
                  navigate(`/tickets/editticket/${item.Id[0]}`, {
                    state: item.TicketNumber,
                  })
                /* canView && navigate(`/tickets/ticketdetails/${item.Id[0]}`) */
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
        title="Delete Ticket"
        content="Are you sure you want to delete this ticket?"
        actionButtonLabel="Delete"
        actionButtonOnClick={deleteTicket}
        permission={!canDelete}
      />
    </>
  );
};

export default TicketTable;

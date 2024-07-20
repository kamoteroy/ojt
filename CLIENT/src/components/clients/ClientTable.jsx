import React, { useEffect, useState, useRef } from "react";
import {
  Badge,
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
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { PlusIcon } from "../../icons/PlusIcon";
import { SearchIcon } from "../../icons/SearchIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { EyeIcon } from "../../icons/EyeIcon";
import { columns } from "../../data/ClientData";
import ModalApp from "../shared/Modal";
import { useNavigate } from "react-router-dom";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import axiosInstance from "../shared/axiosInstance";
import UnAuthorizedPage from "../../pages/403Page";
import { IconCircle } from "../../icons/IconCircle";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../routes/breadcrumb";

const INITIAL_VISIBLE_COLUMNS = [
  "Code",
  "ExpirationStatus",
  "Name",
  "Address",
  "Email",
  "DateSoftwareAcceptance",
  "DateBCSExpiry",
  "actions",
];
const ClientTable = () => {
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
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
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const isInitialRender = useRef(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const user = useSelector((state) => state.user.value);

  //permissions
  const permissions = user.permissions;
  const canAdd = permissions.includes("AddClient");
  const canDelete = permissions.includes("DeleteClient");
  const canView = permissions.includes("ViewClient");

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/getcreatedupdatedby/Client`);
        // Format date fields and add DateCreatedCheck
        const formattedData = response.data.map((client) => {
          const dateCreatedCheck = new Date(); // Replace this with the actual value for DateCreatedCheck
          return {
            ...client,
            DateSoftwareAcceptance: new Date(
              client.DateSoftwareAcceptance
            ).toLocaleDateString(),
            DateBCSExpiry: new Date(client.DateBCSExpiry).toLocaleDateString(),
            DateBCSRenewal: new Date(
              client.DateBCSRenewal
            ).toLocaleDateString(),
            DateCreatedCheck: dateCreatedCheck,
          };
        });

        setClients(formattedData);
        setLoading(false);
        await addAuditTrail(
          currentUserId,
          "ViewAllClient",
          fetchData,
          "Client"
        );
        console.log("Table Viewed Successfully");
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        setError(error);
        console.log("error: ", error);
      }
    };

    fetchData();
  }, []);

  const calculateColor = (DateSoftwareAcceptance, DateBCSExpiry) => {
    /*console.log(
      "DateSoftwareAcceptance, DateBCSExpiry",
      DateSoftwareAcceptance,
      DateBCSExpiry
    );*/
    const today = new Date();
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    const utc1 = Date.UTC(
      DateSoftwareAcceptance.getFullYear(),
      DateSoftwareAcceptance.getMonth(),
      DateSoftwareAcceptance.getDate()
    );
    const utc2 = Date.UTC(
      DateBCSExpiry.getFullYear(),
      DateBCSExpiry.getMonth(),
      DateBCSExpiry.getDate()
    );
    const diff = Math.floor((utc2 - utc1) / _MS_PER_DAY);

    if (diff > 30) {
      return "success"; // More than 1 month, green
    } else if (diff >= 0 && diff <= 30) {
      return "warning"; // 1 month or less, yellow
    } else {
      return "danger"; // Exceeds expiry, red
    }
  };

  const colorMapping = {
    success: {
      background: "green", // Transparent green background
    },
    warning: {
      background: "yellow", // Transparent yellow background
    },
    danger: {
      background: "red", // Transparent red background
    },
  };

  const deleteClient = async () => {
    try {
      const responses = await axiosInstance.delete(
        `/deleterecord/Client/Id/${clientIdToDelete}`
      );
      const response = await axiosInstance.get(`/getallrecord/Client`);
      setClients(response.data);
      setModalOpen(false);
      await addAuditTrail(
        currentUserId,
        "DeleteClient",
        clientIdToDelete,
        "Client"
      );
      showMessage(`${responses.data.message}`, "success");
      console.log("Successfully Deleted");
    } catch (error) {
      console.error("Error deleting client:", error);
      showMessage(`${error.response.data.message}`, "error");
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      setClientIdToDelete(clientId);
      setModalOpen(true);
    } catch (error) {
      console.error("Error handling delete Client:", error);
    }
  };

  const handleRowClick = async (clientId, name) => {
    navigate(`/clients/editclient/${clientId}`, {
      state: { clientName: name },
    });
  };

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredClients = [...clients];

    if (hasSearchFilter) {
      filteredClients = filteredClients.filter(
        (client) =>
          client.Name.toLowerCase().includes(filterValue.toLowerCase()) ||
          client.Code.includes(filterValue)
      );
    }

    if (fromDate && toDate) {
      // Parse fromDate and toDate into Date objects
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      filteredClients = filteredClients.filter((client) => {
        const softwareAcceptanceMonth =
          new Date(client.DateSoftwareAcceptance).getMonth() + 1; // Adding 1 because getMonth returns 0-indexed month
        const bcsExpiryMonth = new Date(client.DateBCSExpiry).getMonth() + 1;

        const fromMonth = fromDateObj.getMonth() + 1;
        const toMonth = toDateObj.getMonth() + 1;

        return (
          (softwareAcceptanceMonth >= fromMonth &&
            softwareAcceptanceMonth <= toMonth) ||
          (bcsExpiryMonth >= fromMonth && bcsExpiryMonth <= toMonth)
        );
      });
      console.log("fromDate, toDate", fromDateObj, toDateObj);
      console.log("filtered tickets", filteredClients);
    }

    return filteredClients;
  }, [clients, filterValue, fromDate, toDate]);

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

  const renderCell = React.useCallback((client, columnKey) => {
    const cellValue = client[columnKey];

    if (
      columnKey === "DateSoftwareAcceptance" ||
      columnKey === "DateBCSExpiry" ||
      columnKey === "DateBCSRenewal"
    ) {
      return new Date(cellValue).toLocaleDateString();
    } else {
      switch (columnKey) {
        case "ExpirationStatus":
          const DateSoftwareAcceptance = new Date(
            client["DateSoftwareAcceptance"]
          );
          const DateBCSExpiry = new Date(client["DateBCSExpiry"]);
          const color = calculateColor(DateSoftwareAcceptance, DateBCSExpiry);
          const backgroundColor = colorMapping[color].background;

          return (
            <div className="flex flex-col">
              <IconCircle color={backgroundColor} />
            </div>
          );
        case "Code":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{cellValue}</p>
            </div>
          );
        case "Name":
        case "Address":
        case "Email":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{cellValue}</p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip color="danger" content="Delete client">
                <Button
                  size="sm"
                  isIconOnly
                  variant="flat"
                  color="warning"
                  isDisabled={!canDelete}
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleDeleteClient(client.Id);
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
    const totalFilteredClients = filteredItems.length;
    return (
      <>
        <Breadcrumbs />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-3 items-center">
            <Input
              isClearable
              className="w-full"
              placeholder="Search by Username / Code"
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
                onClick={() => navigate("/clients/addclient")}
                isDisabled={!canAdd}
              >
                Add New
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-default-400 text-small">
              Total {totalFilteredClients} users
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
    clients.length,
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
        <TableBody emptyContent={"No clients found"} items={sortedItems}>
          {(item) => (
            <TableRow
              key={item.Id}
              className={`hover:bg-gray-200 ${
                canView ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              onClick={() => canView && handleRowClick(item.Id, item.Name)}
            >
              {headerColumns.map((column) => {
                const color = calculateColor(
                  new Date(item.DateSoftwareAcceptance),
                  new Date(item.DateBCSExpiry)
                );
                const cellStyle = colorMapping[color];

                return (
                  <TableCell key={`${item.Id}-${column.uid}`}>
                    {renderCell(item, column.uid)}
                  </TableCell>
                );
              })}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ModalApp
        permission={!canDelete}
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete client"
        content="Are you sure you want to delete this client?"
        actionButtonLabel="Confirm"
        actionButtonOnClick={deleteClient}
      />
    </>
  );
};

export default ClientTable;

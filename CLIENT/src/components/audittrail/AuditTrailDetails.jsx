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
  Pagination,
  Tooltip,
  Link,
  Skeleton,
} from "@nextui-org/react";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { SearchIcon } from "../../icons/SearchIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { columns, statusOptions } from "../../data/AuditTrailData";
import { BASE_URL } from "../../routes/BaseUrl";
import ModalApp from "../shared/Modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../shared/axiosInstance";
import GetPermission from "../shared/GetPermission";
import UnAuthorizedPage from "../../pages/403Page";
import { formatAMPM, formatDate } from "../shared/FormatDate";

const INITIAL_VISIBLE_COLUMNS = [
  "DateCreated",
  "UserId",
  "Username",
  "Action",
  "Record",
  "RecordTable",
  "actions",
];

const AuditTrailDetails = () => {
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
  const [audit, setAudit] = useState([]);
  const [idToDelete, setIdToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //permissions
  const permissions = GetPermission() || [];
  console.log("permissions: ", permissions);
  const canDelete = permissions.includes("DeleteAuditTrail");

  useEffect(() => {
    const initializeDataFetch = async () => {
      try {
        await fetchAllData();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    initializeDataFetch();
  }, []);

  const fetchAllData = async () => {
    try {
      const [response] = await Promise.all([
        axiosInstance.get(`${BASE_URL}/getallaudit/AuditTrail`),
      ]);

      const audit = response.data;
      setAudit(audit);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setLoading(false);
    }
  };

  const deleteData = async () => {
    try {
      await axiosInstance
        .delete(`/deleterecord/AuditTrail/Id/${idToDelete}`)
        .then((res) => {
          console.log(res.data.message);
        });
      fetchAllData();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error Deleting Audit:", error);
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
    let filteredData = [...audit];

    if (hasSearchFilter) {
      filteredData = filteredData.filter(
        (data) =>
          data.Username.toLowerCase().includes(filterValue.toLowerCase()) ||
          data.Action.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredData;
  }, [audit, filterValue, statusFilter]);

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
      case "DateCreated":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {formatDate(cellValue)} | {formatAMPM(cellValue)}
            </p>
          </div>
        );
      case "UserId":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip color="danger" content="Delete Audit">
              <Link
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDeleteData(data.Id)}
              >
                <DeleteIcon />
              </Link>
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
            placeholder="Search by Username or Action"
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
            Total {audit.length} audit
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
    audit.length,
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
        <TableBody emptyContent={"No audit found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.Id} className="hover:bg-gray-200">
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
        title="Delete Audit"
        content="Are you sure you want to delete this Audit?"
        actionButtonLabel="Delete"
        actionButtonOnClick={deleteData}
        permission={!canDelete}
      />
    </>
  );
};

export default AuditTrailDetails;

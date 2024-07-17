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
import { columns } from "../../data/DepartmentData";
import { BASE_URL } from "../../routes/BaseUrl";
import ModalApp from "../shared/Modal";
import EditDepartment from "./EditDepartmentModal";
import AddDepartment from "./AddDepartmentModal";
import ViewDepartment from "./ViewDepartmentModal";
import axiosInstance from "../shared/axiosInstance";
import addAuditTrail from "../shared/RecordAudit";
import ToasterUtils from "../shared/ToasterUtils";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import GetPermission from "../shared/GetPermission";
import UnAuthorizedPage from "../../pages/403Page";
import { useSelector } from "react-redux";

const INITIAL_VISIBLE_COLUMNS = [
  "Code",
  "Name",
  "Description",
  "CreatedByUsername",
  "UpdatedByUsername",
  "actions",
];

/****************************************************************
 * STATUS               : Finished
 * DATE CREATED/UPDATED : 04-01-2024
 * PURPOSE/DESCRIPTION  : Component of DepartmentPage
 * PROGRAMMER           : John Loyd M. Ytang
 * FUNCTION NAME        : DepartmentTable
 *****************************************************************/
const DepartmentTable = () => {
  const [filterValue, setFilterValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "Code",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [viewDepartmentDetails, setViewDepartmentDetails] = useState(null);
  const [departmentIdToDelete, setDepartmentIdToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const isInitialRender = useRef(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user.value);

  //permissions
  const permissions = user.permissions;
  const canAdd = permissions.includes("AddDepartment");
  const canDelete = permissions.includes("DeleteDepartment");
  const canView = permissions.includes("ViewDepartment");

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const initializeDataFetch = async () => {
      try {
        await fetchAllDepartmentData();
        await addAuditTrail(
          currentUserId,
          "ViewAllDepartment",
          initializeDataFetch,
          "Department"
        );
        console.log("Table Viewed Successfully");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    initializeDataFetch();
  }, []);

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : For Fetching all Departments
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : fetchAllDepartmentData
   *****************************************************************/
  const fetchAllDepartmentData = async () => {
    try {
      const [departmentResponse] = await Promise.all([
        axiosInstance.get(`${BASE_URL}/getcreatedupdatedby/Department`),
      ]);
      const departments = departmentResponse.data;
      setDepartments(departments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setLoading(false);
    }
  };

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : For Single Departments
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : fetchSingleDepartmentData
   *****************************************************************/
  const fetchSingleDepartmentData = async (departmentId) => {
    if (departmentId) {
      try {
        const response = await axiosInstance.get(
          `/getrecord/Department/Id/${departmentId}`
        );
        setViewDepartmentDetails(response.data);
        console.log(departmentId);
        console.log(response);
        await addAuditTrail(
          currentUserId,
          "ViewDepartment",
          departmentId,
          "Department"
        );
        showMessage("Record Viewed Successfully", "success");
      } catch (error) {
        showMessage("Error fetching:", "error");
      }
    }
  };

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Deleting the Departments data and popping up the delete modal
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : deleteDepartment
   *****************************************************************/
  const deleteDepartment = async () => {
    try {
      const response = await axiosInstance.delete(
        `/deleterecord/Department/Id/${departmentIdToDelete}`
      );
      console.log(response.data.message);
      console.log(departmentIdToDelete);
      console.log(response);

      await addAuditTrail(
        currentUserId,
        "DeleteDepartment",
        departmentIdToDelete,
        "Department"
      );
      fetchAllDepartmentData();
      setDeleteModalOpen(false);
      showMessage(`${response.data.message}`, "success");
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
    }
  };

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the Modal and View of data
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : handleViewDepartment
   *****************************************************************/
  const handleViewDepartment = async (departmentId) => {
    try {
      await fetchSingleDepartmentData(departmentId);
      setViewModalOpen(true);
      setSelectedDepartmentId(departmentId);
    } catch (error) {
      console.error("Error handling view Department:", error);
    }
  };

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the Modal and Edit the data
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : handleEditDepartment
   *****************************************************************/
  const handleEditDepartment = async (departmentId) => {
    try {
      await fetchSingleDepartmentData(departmentId);
      setSelectedDepartmentId(departmentId);
      setEditModalOpen(true);
      console.log("Edit id", departmentId);
    } catch (error) {
      console.error("Error handling edit Department:", error);
    }
  };

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Deleting the Departments data and popping up the delete modal
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : deleteDepartment
   *****************************************************************/
  const handleDeleteDepartment = async (departmentId) => {
    try {
      setDepartmentIdToDelete(departmentId);
      setDeleteModalOpen(true);
    } catch (error) {
      console.error("Error handling delete Department:", error);
    }
  };

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the search
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : headerColumns
   *****************************************************************/
  const hasSearchFilter = Boolean(filterValue);
  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the Filter
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : filteredItems
   *****************************************************************/
  const filteredItems = React.useMemo(() => {
    let filteredDepartments = [...departments];
    if (hasSearchFilter) {
      filteredDepartments = filteredDepartments.filter(
        (department) =>
          department.Name.toLowerCase().includes(filterValue.toLowerCase()) ||
          department.Code.includes(filterValue)
      );
    }

    return filteredDepartments;
  }, [departments, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the Pages & rows
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : items
   *****************************************************************/
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the Sorted Items
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : sortedItems
   *****************************************************************/
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

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the  Cells and Icons inside the table
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : renderCell
   *****************************************************************/
  const renderCell = React.useCallback((department, columnKey) => {
    const cellValue = department[columnKey];

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
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit department">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="secondary"
                className={`text-lg text-default-400 cursor-pointer active:opacity-50`}
                onClick={() => {
                  handleEditDepartment(department.Id);
                }}
              >
                <EditIcon />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Delete department">
              <Button
                size="sm"
                isIconOnly
                variant="flat"
                color="warning"
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDeleteDepartment(department.Id)}
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

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the  Search, Columns and Add new above the cells
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : topContent
   *****************************************************************/
  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-center">
          <Input
            isClearable
            className="w-full"
            placeholder="Search department name or code"
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
            Total {departments.length} departments
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
    visibleColumns,
    onRowsPerPageChange,
    departments.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  /****************************************************************
   * STATUS               : Finished
   * DATE CREATED/UPDATED : 04-01-2024
   * PURPOSE/DESCRIPTION  : Handles the  Pages and Next and Previous button
   * PROGRAMMER           : John Loyd M. Ytang
   * FUNCTION NAME        : bottomContent
   *****************************************************************/
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
        <TableBody emptyContent={"No departments found"} items={sortedItems}>
          {(item) => (
            <TableRow
              key={item.Id}
              className="hover:bg-gray-200 cursor-pointer"
            >
              {headerColumns.map((column) => (
                <TableCell key={`${item.Id}-${column.uid}`} color="success">
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
        title="Delete department"
        content="Are you sure you want to delete this department?"
        actionButtonLabel="Delete"
        actionButtonOnClick={deleteDepartment}
        permission={!canDelete}
      />
      <AddDepartment
        isOpen={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchAllDepartmentData}
      />
      <EditDepartment
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={fetchAllDepartmentData}
        departmentId={selectedDepartmentId}
        details={viewDepartmentDetails}
      />
      <ViewDepartment
        isOpen={viewModalOpen}
        onOpenChange={setViewModalOpen}
        departmentId={selectedDepartmentId}
        details={viewDepartmentDetails}
      />
    </>
  );
};

export default DepartmentTable;

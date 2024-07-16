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
  Divider,
  Pagination,
  Tooltip,
  Link,
} from "@nextui-org/react";
import { ChevronDownIcon } from "../../icons/ChevronDownIcon";
import { PlusIcon } from "../../icons/PlusIcon";
import { SearchIcon } from "../../icons/SearchIcon";
import { EditIcon } from "../../icons/EditIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { EyeIcon } from "../../icons/EyeIcon";
import { columns } from "../../data/AttachmentData";
import { BASE_URL } from "../../routes/BaseUrl";
import { useNavigate, useLocation } from "react-router-dom";
import ModalApp from "../shared/Modal";
import ViewModal from "../tickets/ViewModal";
import axiosInstance from "../shared/axiosInstance";
import AddAttachmentModal from "./AddAttachmentModal";

const INITIAL_VISIBLE_COLUMNS = [
  // "Id",
  // "TicketId",
  // "TicketReviewId",
  "Attachment",
  "actions",
];

const AttachmentTable = (props) => {
  const { ticketId } = props;
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
  const [attachments, setAttachments] = useState([]);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState(null);
  const [viewAttachmentDetails, setViewAttachmentDetails] = useState(null);
  const [attachmentIdToDelete, setAttachmentIdToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchAllAttachment = async () => {
    const isEditTicket = location.pathname.includes("editticket");
    const isDetailsTicket = location.pathname.includes("ticketdetails");
    try {
      let attachmentResponse;
      attachmentResponse = await axiosInstance.get(
        isEditTicket || isDetailsTicket
          ? `/getrecord/Attachment/TicketId/${ticketId}`
          : `/getrecord/Attachment/TicketReviewId/${ticketId}`
      );

      let attachments = attachmentResponse.data;
      setAttachments(attachments);

      /* if (!isEditTicket && !isDetailsTicket) {
        const attachmentTicketIdResponse = await axiosInstance.get(
          `/getrecord/Attachment/TicketId/${ticketId}`
        );

        console.log("attachmentTicketIdResponse", attachmentTicketIdResponse);

        if (attachmentTicketIdResponse) {
          attachmentResponse = await axiosInstance.get(
            `/getrecord/Attachment/TicketReviewId/${attachmentTicketIdResponse.data[0].TicketReviewId}`
          );
          attachments = attachmentResponse.data;
          setAttachments(attachments);
        }
      } */
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const initializeDataFetch = async () => {
      try {
        await fetchAllAttachment();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    initializeDataFetch();
  }, []);

  /* useEffect(() => {
    const fetchData = async () => {
      try {
        const attachmentReponse = await axiosInstance.get(
          `/getrecord/Attachment/TicketId/${ticketId}`
        );
        console.log("attachment table", attachmentReponse.data);
        setAttachments(attachmentReponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); */

  const handleViewModal = (item) => {
    setSelectedImage(`${BASE_URL}/images/${item}`);
    setViewModalOpen(true);
  };

  const deleteAttachment = async () => {
    try {
      await axiosInstance
        .get(`/deleteimage/Attachment/Id/${attachmentIdToDelete}`)
        .then((res) => {
          console.log(res.data.message);
        })
        .catch((err) => console.log(err));
      fetchAllAttachment();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error Deleting Attachment:", error);
    }
  };

  const handleDeleteAttachment = async (ticketId) => {
    try {
      setAttachmentIdToDelete(ticketId);
      setDeleteModalOpen(true);
    } catch (error) {
      console.error("Error handling delete Department:", error);
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
    let filteredAttachments = [...attachments];
    if (hasSearchFilter) {
      filteredAttachments = filteredAttachments.filter(
        (attachment) =>
          attachment.Attachment.toLowerCase().includes(
            filterValue.toLowerCase()
          ) || attachment.Code.includes(filterValue)
      );
    }

    return filteredAttachments;
  }, [attachments, filterValue]);

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

  const renderCell = React.useCallback((attachments, columnKey) => {
    const cellValue = attachments[columnKey];

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
            <Tooltip color="danger" content="Delete attachment">
              <Link
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDeleteAttachment(attachments.Id)}
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
      <div className="flex flex-col gap-4 pt-5">
        <div className="flex justify-end gap-3 items-center">
          <div className="flex gap-3">
            <Button
              color="primary"
              endContent={<PlusIcon />}
              size="lg"
              onPress={() => setAddModalOpen(true)}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {attachments.length} attachments
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
    attachments.length,
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
      {" "}
      <div className="flex flex-row text-2xl font-bold uppercase">
        Attachment
      </div>
      <Divider />
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[400px] mt-5", // Added padding top 10
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
        <TableBody emptyContent={"No attachments found"} items={sortedItems}>
          {(item) => (
            <TableRow
              key={item.Id}
              onClick={() => handleViewModal(item.Attachment)}
              className="hover:bg-gray-200 cursor-pointer"
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
        title="Delete Attachment"
        content="Are you sure you want to delete this attachment?"
        actionButtonLabel="Delete"
        actionButtonOnClick={deleteAttachment}
      />
      <ViewModal
        isOpen={viewModalOpen}
        onOpenChange={setViewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Attachment Preview"
        content={
          selectedImage && (
            <img src={selectedImage} alt="Attachment" className="w-full" />
          )
        }
      />
      <AddAttachmentModal
        isOpen={addModalOpen}
        onOpenChange={setAddModalOpen}
        ticketId={ticketId}
        onSuccess={fetchAllAttachment}
      />
    </>
  );
};

export default AttachmentTable;

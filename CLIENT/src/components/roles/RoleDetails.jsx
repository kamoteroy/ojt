import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Image,
  Input,
  Skeleton,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  RadioGroup,
  Radio,
  getKeyValue,
  Spinner,
  Tooltip,
  Link,
} from "@nextui-org/react";
import ModalApp from "../shared/Modal";
import { EditIcon } from "../../icons/EditIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../shared/axiosInstance";
import { PlusIcon } from "../../icons/PlusIcon";
import AddPermission from "./AddPermissionModal";
import addAuditTrail from "../shared/RecordAudit";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import ToasterUtils from "../shared/ToasterUtils";
import { formatDate, formatAMPM } from "../shared/FormatDate";
import GetPermission from "../shared/GetPermission";
import UnAuthorizedPage from "../../pages/403Page";
import Breadcrumbs from "../../routes/breadcrumb";

const colors = [
  "default",
  "primary",
  "secondary",
  "success",
  "warning",
  "danger",
];

const RoleDetails = () => {
  const { id } = useParams();
  const { currentUserId } = useCurrentUser();
  const { showMessage } = ToasterUtils();
  const [details, setDetails] = useState("");
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = React.useState("primary");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "AccessRight",
    direction: "descending",
  });
  const [idToDelete, setIdToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditable, setIsEditable] = useState(false);

  //permissions
  const permissions = GetPermission() || [];
  console.log("permissions: ", permissions);
  const canEdit = permissions.includes("EditRole");
  const canAdd = permissions.includes("AddPermission");
  const canDelete = permissions.includes("DeletePermission");

  const handleEditToggle = () => {
    setIsEditable(!isEditable);
    text === "USER DETAILS"
      ? setText("EDIT USER DETAILS")
      : setText("USER DETAILS");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/getrolepermissions/${id}`);
      setDetails(response.data[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching:", error);
      setLoading(false);
      setError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortedAccessRights = React.useMemo(() => {
    if (!details || !details.AccessRight) return [];

    const sortedData = [...details.AccessRight].sort((a, b) => {
      const first = a.AccessRight;
      const second = b.AccessRight;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });

    return sortedData;
  }, [details, sortDescriptor]);

  const filteredAccessRights = sortedAccessRights.filter((access) =>
    access.AccessRight.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteData = async () => {
    try {
      const response = await axiosInstance.delete(
        `/deleterecord/Permission/Id/${idToDelete}`
      );
      await addAuditTrail(currentUserId, "DeleteRole", idToDelete, "Role");
      showMessage(`${response.data.message}`, "success");
      fetchData();
      setDeleteModalOpen(false);
    } catch (error) {
      showMessage(`${error.response.data.message}`, "error");
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
  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <UnAuthorizedPage />;
  }

  return (
    <>
      <Breadcrumbs name={details.Name} />
      <div className="bg-white min-h-fit py-10 px-8">
        <div className="flex flex-row text-2xl font-bold uppercase">
          {`${details.Name || ""} Details`}
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            color="secondary"
            className={`-mt-4 text-lg text-default-400 cursor-pointer active:opacity-50 ml-auto`}
            onClick={handleEditToggle}
            isDisabled={!canEdit}
          >
            <EditIcon />
          </Button>
        </div>
        <Divider />
        <div className="flex-row py-3 uppercase font-bold pb-14">
          Primary Information
        </div>
        {/* Primary Information */}
        <div className="flex flex-col md:flex-row gap-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-3">
            <Input
              type="text"
              label="Role Name"
              value={details.Name || ""}
              readOnly
            />
            <Input
              type="text"
              label="Description"
              value={details.Description || ""}
              readOnly
            />
          </div>
        </div>
        <Divider />
        <div className="flex flex-row items-center pt-10 pb-3 uppercase font-bold justify-between">
          <h1 className="text-xl"> Access Rights</h1>
        </div>
        <div className="flex flex-row justify-between items-center gap-4">
          <Input
            type="text"
            label="Search"
            placeholder="Search Access Right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        <div className="flex flex-col gap-3 pt-5">
          <Table
            color={selectedColor}
            selectionMode="single"
            sortDescriptor={sortDescriptor}
            aria-label="Example static collection table"
            onSortChange={setSortDescriptor}
          >
            <TableHeader>
              <TableColumn allowsSorting={details.AccessRight}>
                Access Right
              </TableColumn>
              <TableColumn>Date Added</TableColumn>
              <TableColumn>Action</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No rows to display."}>
              {filteredAccessRights.map((access, index) => (
                <TableRow key={index}>
                  <TableCell>{access.AccessRight}</TableCell>
                  <TableCell>
                    {formatDate(access.PermissionDateCreated)}
                  </TableCell>

                  <TableCell>
                    {/* Action Cell */}
                    <div className="relative flex items-center gap-2">
                      {/* Edit Icon */}
                      <Tooltip content="Edit role"></Tooltip>
                      {/* Delete Icon */}
                      <Tooltip color="danger" content="Delete role">
                        <Link
                          className="text-lg text-danger cursor-pointer active:opacity-50"
                          onClick={() => handleDeleteData(access.PermissionId)}
                          isDisabled={!canDelete}
                        >
                          <DeleteIcon />
                        </Link>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ModalApp
            isOpen={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            title="Delete Permission"
            content="Are you sure you want to delete this Permission?"
            actionButtonLabel="Delete"
            actionButtonOnClick={deleteData}
            permission={!canDelete}
          />
        </div>
        <div className="pt-10 justify-end flex gap-4">
          <Button color="primary" variant="ghost" onClick={handleGoBack}>
            Back
          </Button>
        </div>
        <AddPermission
          isOpen={addModalOpen}
          onOpenChange={setAddModalOpen}
          roleId={id}
          onSuccess={fetchData}
        />
      </div>
    </>
  );
};

export default RoleDetails;

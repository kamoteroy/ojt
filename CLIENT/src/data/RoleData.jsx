const columns = [
  { name: "ID", uid: "Id", sortable: true },
  { name: "CODE", uid: "Code", sortable: true },
  { name: "ROLE", uid: "Name", sortable: true },
  { name: "DESCRIPTION", uid: "Description", sortable: true },
  // { name: "CREATED BY", uid: "CreatedBy", sortable: true },
  { name: "CREATED BY", uid: "CreatedByUsername", sortable: true },
  // { name: "UPDATED BY", uid: "UpdatedBy", sortable: true },
  { name: "UPDATED BY", uid: "UpdatedByUsername", sortable: true },
  // { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Disabled", uid: "disabled" },
];

export { columns, statusOptions };

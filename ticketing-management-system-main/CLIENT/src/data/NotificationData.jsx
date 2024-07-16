const columns = [
  { name: "SELECT", uid: "Checkbox", sortable: false },
  { name: "ID", uid: "Id", sortable: true },
  { name: "USERID", uid: "UserId", sortable: true },
  { name: "FULLNAME", uid: "Firstname", sortable: true },
  { name: "DESCRIPTION", uid: "Description", sortable: true },
  { name: "DATE", uid: "DateCreated", sortable: true },
  { name: "STATUS", uid: "Status" },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Read", uid: "read" },
  { name: "Unread", uid: "unread" },
];

export { columns, statusOptions };

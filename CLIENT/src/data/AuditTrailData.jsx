const columns = [
  { name: "LOG DATE/TIME", uid: "DateCreated", sortable: true },
  { name: "USERID", uid: "UserId", sortable: true },
  { name: "USERNAME", uid: "Username", sortable: true },
  { name: "ACTION", uid: "Action", sortable: true },
  { name: "RECORD", uid: "Record", sortable: true },
  { name: "TABLE", uid: "RecordTable", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Disabled", uid: "disabled" },
];

export { columns, statusOptions };

const columns = [
  { name: "ID", uid: "Id", sortable: true },
  { name: "CODE", uid: "Code", sortable: true },
  { name: "USERNAME", uid: "Username", sortable: true },
  { name: "FULLNAME", uid: "Firstname", sortable: true },
  { name: "ROLE", uid: "Role", sortable: true },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Disabled", uid: "disabled" },
];

const statusColorMap = {
  active: "success",
  disabled: "danger",
};

const INITIAL_VISIBLE_COLUMNS = [
  "Code",
  "Username",
  "Firstname",
  "status",
  "actions",
];

export { columns, statusOptions, statusColorMap, INITIAL_VISIBLE_COLUMNS };

const columns = [
  { name: "ID", uid: "Id", sortable: true },
  { name: "", uid: "ExpirationStatus" },
  { name: "DATE", uid: "DateCreated", sortable: true },
  { name: "TICKETNUMBER", uid: "TicketNumber", sortable: true },
  { name: "CLIENTNAME", uid: "ClientName", sortable: true },
  { name: "PRODUCT", uid: "Product" },
  { name: "CALLER", uid: "Caller", sortable: true },
  { name: "CONCERN", uid: "Concern", sortable: true },
  { name: "CATEGORY", uid: "Category" },
  { name: "SEVERITY", uid: "Severity" },
  { name: "STAFF ASSIGNED", uid: "AssignedBy" },
  { name: "STATUS", uid: "Status" },
  { name: "BCS EXPIRY", uid: "DateBCSExpiry" },
  { name: "ACTIONS", uid: "Actions" },
];

const statusOptions = [
  { name: "Solved", uid: "solved", value: 1 },
  { name: "Ongoing", uid: "ongoing", value: 0 },
];

const ticketCategory = [
  {
    name: "All",
    value: "All",
    uid: "all",
  },
  {
    name: "New Installation",
    value: "New Installation",
    uid: "new-installation",
  },
  {
    name: "Software Bug",
    value: "Software Bug",
    uid: "software-bug",
  },
  {
    name: "Data Tracking",
    value: "Data Tracking",
    uid: "data-tracking",
  },
  {
    name: "New Feature",
    value: "New Feature",
    uid: "new-feature",
  },
  {
    name: "Hardware or Infrastructure Problem",
    value: "Hardware or Infrastructure Problem",
    uid: "hardware-or-infrastructure-problem",
  },
  {
    name: "Retraining",
    value: "Retraining",
    uid: "retraining",
  },
  {
    name: "Reinstallation",
    value: "Reinstallation",
    uid: "reinstallation",
  },
  {
    name: "Program Update",
    value: "Program Update",
    uid: "program-update",
  },
  {
    name: "Data Archiving/Truncate",
    value: "Data Archiving/Truncate",
    uid: "data-archiving-truncate",
  },
];

export { columns, statusOptions, ticketCategory };

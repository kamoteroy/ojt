/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-18-2024
 * PURPOSE/DESCRIPTION  : To specify the Tables, Routes, and Methods
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : crudPermissionsMap
 *****************************************************************/
const crudPermissionsMap = {
  User: {
    "/getallrecord": { GET: "ViewAllUser" },
    "/getrecord": { GET: "ViewUser" },
    "/getuserleftrole": { GET: "ViewAllUser" },
    "/getuserroledept": { GET: "ViewUser" },
    "/getcreatedupdatedby": { GET: "ViewAllUser" },
    "/addrecord": { POST: "AddUser" },
    "/createuser": { POST: "AddUser" },
    "/updaterecord": { PUT: "EditUser" },
    "/deleteallrecord": { DELETE: "DeleteAllUser" },
    "/deleterecord": { DELETE: "DeleteUser" },
  },
  AccessRight: {
    "/getallrecord": { GET: "ViewAllAccessRight" },
    "/getrecord": { GET: "ViewAccessRight" },
    "/getcreatedupdatedby": { GET: "ViewAllAccessRight" },
    "/addrecord": { POST: "AddAccessRight" },
    "/updaterecord": { PUT: "EditAccessRight" },
    "/deleteallrecord": { DELETE: "DeleteAllAccessRight" },
    "/deleterecord": { DELETE: "DeleteAccessRight" },
  },
  Client: {
    "/getallrecord": { GET: "ViewAllClient" },
    "/getrecord": { GET: "ViewClient" },
    "/getcreatedupdatedby": { GET: "ViewAllClient" },
    "/addrecord": { POST: "AddClient" },
    "/updaterecord": { PUT: "EditClient" },
    "/deleteallrecord": { DELETE: "DeleteAllClient" },
    "/deleterecord": { DELETE: "DeleteClient" },
  },
  Department: {
    "/getallrecord": { GET: "ViewAllDepartment" },
    "/getrecord": { GET: "ViewDepartment" },
    "/getcreatedupdatedby": { GET: "ViewAllDepartment" },
    "/addrecord": { POST: "AddDepartment" },
    "/updaterecord": { PUT: "EditDepartment" },
    "/deleteallrecord": { DELETE: "DeleteAllDepartment" },
    "/deleterecord": { DELETE: "DeleteDepartment" },
  },
  Permission: {
    "/getallrecord": { GET: "ViewAllPermission" },
    "/getrecord": { GET: "ViewPermission" },
    "/getcreatedupdatedby": { GET: "ViewAllPermission" },
    "/addrecord": { POST: "AddPermission" },
    "/updaterecord": { PUT: "EditPermission" },
    "/deleteallrecord": { DELETE: "DeleteAllPermission" },
    "/deleterecord": { DELETE: "DeletePermission" },
  },
  Product: {
    "/getallrecord": { GET: "ViewAllProduct" },
    "/getrecord": { GET: "ViewProduct" },
    "/getcreatedupdatedby": { GET: "ViewAllProduct" },
    "/addrecord": { POST: "AddProduct" },
    "/updaterecord": { PUT: "EditProduct" },
    "/deleteallrecord": { DELETE: "DeleteAllProduct" },
    "/deleterecord": { DELETE: "DeleteProduct" },
  },
  Role: {
    "/getallrecord": { GET: "ViewAllRole" },
    "/getrecord": { GET: "ViewRole" },
    "/getcreatedupdatedby": { GET: "ViewAllRole" },
    "/addrecord": { POST: "AddRole" },
    "/updaterecord": { PUT: "EditRole" },
    "/deleteallrecord": { DELETE: "DeleteAllRole" },
    "/deleterecord": { DELETE: "DeleteRole" },
  },
  Ticket: {
    "/getallrecord": { GET: "ViewAllTicket" },
    "/getticketclientuserproduct": { GET: "ViewAllTicket" },
    "/getrecord": { GET: "ViewTicket" },
    "/getsingleticketclientuserproduct": { GET: "ViewTicket" },
    "/getcreatedupdatedby": { GET: "ViewAllTicket" },
    "/addrecord": { POST: "AddTicket" },
    "/updaterecord": { PUT: "EditTicket" },
    "/deleteallrecord": { DELETE: "DeleteAllTicket" },
    "/deleterecord": { DELETE: "DeleteTicket" },
    "/getRecordCount": { GET: "ViewAllTicketData" },
    "/getMonthlyRecordCount": { GET: "ViewMonthlyTicketData" },
  },
  TicketLine: {
    "/getallrecord": { GET: "ViewAllTicketLine" },
    "/getrecord": { GET: "ViewTicketLine" },
    "/getcreatedupdatedby": { GET: "ViewAllTicketLine" },
    "/addrecord": { POST: "AddTicketLine" },
    "/addrecordnocode": { POST: "AddTicketLine" },
    "/updaterecord": { PUT: "EditTicketLine" },
    "/deleteallrecord": { DELETE: "DeleteAllTicketLine" },
    "/deleterecord": { DELETE: "DeleteTicketLine" },
  },
  TicketReview: {
    "/getAvgCount": { GET: "ViewAverageRate" },
  },
  AuditTrail: {
    "/getallaudit": { GET: "ViewAllAuditTrail" },
    "/deleterecord": { GET: "DeleteAuditTrail" },
  },
};
// crudPermissionsMap

module.exports = crudPermissionsMap;

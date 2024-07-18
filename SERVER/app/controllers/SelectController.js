const {
  getRolePermissions,
  getRoleAccessRights,
  getAccessRightPermission,
} = require("../functions/PermissionHandler");
const err = require("../message/Error.json");
const success = require("../message/Success.json");
const Select = require("../models/SelectModel");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-17-2024
 * PURPOSE/DESCRIPTION  : To get User with Role from SelectModel
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getUserLeftRole
 *****************************************************************/
async function getUserLeftRole(req, res) {
  const { table } = req.params;
  try {
    const result = await Select.userLeftRole(table);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getUserLeftRole

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-17-2024
 * PURPOSE/DESCRIPTION  : To get User with Role and Department from SelectModel
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getUserRoleAndDepartment
 *****************************************************************/
async function getUserRoleAndDepartment(req, res) {
  const { table, userId } = req.params;
  try {
    const result = await Select.userRoleAndDepartment(table, userId);
    if (!result) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getRoleAndDeptErr, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getUserRoleAndDepartment

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-19-2024
 * PURPOSE/DESCRIPTION  : To get Role and Department for AddUser from SelectModel
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getSelectRoleDepartment
 *****************************************************************/
async function getSelectRoleDepartment(req, res) {
  try {
    const result = await Select.selectRoleDept();
    if (!result) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.selectRoleDeptErr, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getSelectRoleDepartment

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-17-2024
 * PURPOSE/DESCRIPTION  : To get Created/UpdatedBy for tables Username from SelectModel
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getCreatedUpdatedBy
 *****************************************************************/
async function getCreatedUpdatedBy(req, res) {
  const { table } = req.params;
  try {
    const result = await Select.getCreatedUpdatedBy(table);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getCreatedUpdatedBy

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-28-2024
 * PURPOSE/DESCRIPTION  : to get Ticket, Client, User, Product from SelectModel
 * PROGRAMMER           : Joebert L. Cerezo
 * FUNCTION NAME        : getTicketClientUserProduct
 *****************************************************************/
async function getTicketClientUserProduct(req, res) {
  const { table } = req.params;
  try {
    const result = await Select.selectTicketClientUserProduct(table);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getTicketClientUserProduct

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-28-2024
 * PURPOSE/DESCRIPTION  : to get single Ticket, Client, User, Product from SelectModel
 * PROGRAMMER           : Joebert L. Cerezo
 * FUNCTION NAME        : getSingleTicketClientUserProduct
 *****************************************************************/
async function getSingleTicketClientUserProduct(req, res) {
  const { table, ticketId } = req.params;
  try {
    const result = await Select.selectSingleTicketClientUserProduct(
      table,
      ticketId
    );
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getSingleTicketClientUserProduct

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-14-2024
 * PURPOSE/DESCRIPTION  : to get permissions based on RoleId
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getPermission
 *****************************************************************/
async function getPermission(req, res) {
  const { roleId } = req.params;
  try {
    const result = await getRolePermissions(roleId);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getPermission

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-14-2024
 * PURPOSE/DESCRIPTION  : to get permissions based on RoleId
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getExcludedAccessRights
 *****************************************************************/
async function getExcludedAccessRights(req, res) {
  const { roleId } = req.params;
  try {
    const result = await getRoleAccessRights(roleId);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getExcludedAccessRights

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-21-2024
 * PURPOSE/DESCRIPTION  : to get remaining permissions based on RoleId
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : getRemainingAccessRights
 *****************************************************************/
async function getRemainingAccessRights(req, res) {
  const { roleId } = req.params;
  try {
    const result = await getAccessRightPermission(roleId);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getRemainingAccessRights

module.exports = {
  getUserLeftRole,
  getUserRoleAndDepartment,
  getSelectRoleDepartment,
  getCreatedUpdatedBy,
  getTicketClientUserProduct,
  getSingleTicketClientUserProduct,
  getPermission,
  getExcludedAccessRights,
  getRemainingAccessRights,
};

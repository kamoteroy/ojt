const sql = require("mssql");
const crudPermissionsMap = require("../models/PermissionModel");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-18-2024
 * PURPOSE/DESCRIPTION  : To get User Permissions
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getUserRolePermissions
 *****************************************************************/
async function getUserRolePermissions(userId) {
  try {
    const request = new sql.Request();
    request.input("userId", sql.Int, userId);
    const query = `
      SELECT AR.Name AS AccessRight
      FROM Permission AS P
      INNER JOIN AccessRight AS AR ON P.AccessRightId = AR.Id
      INNER JOIN Role AS R ON P.RoleId = R.Id
      INNER JOIN [User] AS U ON R.Id = U.RoleId
      WHERE U.Id = @userId;
    `;
    const result = await request.query(query);
    const permissions = result.recordset.map((row) => row.AccessRight);
    // console.log("USER PERMISSIONSSSSSSSS", permissions);
    return permissions;
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return null;
  }
}
// End of getUserRolePermissions

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-18-2024
 * PURPOSE/DESCRIPTION  : To get required permission such as route endpoint and methods
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getRequiredPermission
 *****************************************************************/
function getRequiredPermission(table, endpoint, method) {
  if (!crudPermissionsMap.hasOwnProperty(table)) {
    console.error(`Table '${table}' not found in CRUD permissions map`);
    return null;
  }

  const tablePermissions = crudPermissionsMap[table];
  if (!tablePermissions.hasOwnProperty(endpoint)) {
    console.error(
      `Endpoint '${endpoint}' not found for table '${table}' in CRUD permissions map`
    );
    return null;
  }

  const methodPermissions = tablePermissions[endpoint];
  if (!methodPermissions.hasOwnProperty(method)) {
    console.error(
      `Method '${method}' not found for endpoint '${endpoint}' and table '${table}' in CRUD permissions map`
    );
    return null;
  }
  return methodPermissions[method];
}
// End of getRequiredPermission

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-14-2024
 * PURPOSE/DESCRIPTION  : To get Permissions based on RoleId
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getRolePermissions
 *****************************************************************/
async function getRolePermissions(roleId) {
  try {
    const request = new sql.Request();
    request.input("roleId", sql.Int, roleId);

    const query = `
      SELECT R.*, AR.Name AS AccessRight, P.Id AS PermissionId,
             P.DateCreated AS PermissionDateCreated,
             P.DateUpdated AS PermissionDateUpdated,
             P.CreatedBy AS PermissionCreatedBy,
             P.UpdatedBy AS PermissionUpdatedBy,
             U1.Username AS PermissionCreatedByUsername,
             U2.Username AS PermissionUpdatedByUsername,
             U3.Username AS CreatedByUsername,
             U4.Username AS UpdatedByUsername
      FROM Role AS R
      LEFT JOIN Permission AS P ON R.Id = P.RoleId
      LEFT JOIN AccessRight AS AR ON P.AccessRightId = AR.Id
      LEFT JOIN [User] AS U1 ON P.CreatedBy = U1.Id
      LEFT JOIN [User] AS U2 ON P.UpdatedBy = U2.Id
      LEFT JOIN [User] AS U3 ON R.CreatedBy = U3.Id
      LEFT JOIN [User] AS U4 ON R.UpdatedBy = U4.Id
      WHERE R.Id = @roleId;
    `;
    const result = await request.query(query);

    const groupedResult = result.recordset.reduce((acc, curr) => {
      const existingRole = acc.find((role) => role.Id === curr.Id);
      if (existingRole) {
        existingRole.AccessRight.push({
          AccessRight: curr.AccessRight,
          PermissionId: curr.PermissionId,
          PermissionDateCreated: curr.PermissionDateCreated,
          PermissionDateUpdated: curr.PermissionDateUpdated,
          PermissionCreatedBy: curr.PermissionCreatedBy,
          PermissionUpdatedBy: curr.PermissionUpdatedBy,
          PermissionCreatedByUsername: curr.PermissionCreatedByUsername,
          PermissionUpdatedByUsername: curr.PermissionUpdatedByUsername,
        });
      } else {
        acc.push({
          Id: curr.Id,
          Code: curr.Code,
          Name: curr.Name,
          Description: curr.Description,
          CreatedBy: curr.CreatedBy,
          DateCreated: curr.DateCreated,
          CreatedByUsername: curr.CreatedByUsername,
          UpdatedBy: curr.UpdatedBy,
          DateUpdated: curr.DateUpdated,
          UpdatedByUsername: curr.UpdatedByUsername,
          AccessRight: curr.AccessRight
            ? [
                {
                  AccessRight: curr.AccessRight,
                  PermissionId: curr.PermissionId,
                  PermissionDateCreated: curr.PermissionDateCreated,
                  PermissionDateUpdated: curr.PermissionDateUpdated,
                  PermissionCreatedBy: curr.PermissionCreatedBy,
                  PermissionUpdatedBy: curr.PermissionUpdatedBy,
                  PermissionCreatedByUsername: curr.PermissionCreatedByUsername,
                  PermissionUpdatedByUsername: curr.PermissionUpdatedByUsername,
                },
              ]
            : [],
        });
      }
      return acc;
    }, []);

    return groupedResult;
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return null;
  }
}
// End of getRolePermissions

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-20-2024
 * PURPOSE/DESCRIPTION  : To get AccessRights that Role does not have based on RoleId
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getRoleAccessRights
 *****************************************************************/
async function getRoleAccessRights(roleId) {
  try {
    const request = new sql.Request();
    request.input("roleId", sql.Int, roleId);

    const query = `
      SELECT AR.*
      FROM AccessRight AS AR
      LEFT JOIN Permission AS P
      ON AR.Id = P.AccessRightId AND P.RoleId = @roleId
      WHERE P.AccessRightId IS NULL;
    `;

    const result = await request.query(query);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching role access rights:", error);
    return null;
  }
}
// End of getRoleAccessRights
/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-21-2024
 * PURPOSE/DESCRIPTION  : To get Remaining Permissions based on RoleId
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : getAccessRightPermission
 *****************************************************************/
async function getAccessRightPermission(roleId) {
  try {
    const request = new sql.Request();
    request.input("RoleId", sql.Int, roleId);
    const query = `
    SELECT AR.Id, AR.Name AS AccessRight
    FROM AccessRight AS AR
    WHERE AR.Id NOT IN (
        SELECT P.AccessRightId
        FROM Permission AS P
        WHERE P.RoleId = @roleId
    );
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return null;
  }
}

module.exports = {
  getUserRolePermissions,
  getRequiredPermission,
  getRolePermissions,
  getRoleAccessRights,
  getAccessRightPermission
};

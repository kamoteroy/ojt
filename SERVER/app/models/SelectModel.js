const sql = require("mssql");

const Select = {
  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-17-2024
   * PURPOSE/DESCRIPTION  : To get user with role query to be used by SelectController
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : userLeftRole
   *****************************************************************/
  async userLeftRole(table) {
    const request = new sql.Request();
    const query = `
        SELECT u.*, r.Name as Role
        FROM [${table}] u
        LEFT JOIN Role r ON u.RoleId = r.Id
      `;
    const result = await request.query(query);
    return result.recordset;
  },
  // End of userLeftRole

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-17-2024
   * PURPOSE/DESCRIPTION  : To get Role and Department of User query to be used by SelectController
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : deleteRecord
   *****************************************************************/
  async userRoleAndDepartment(table, userId) {
    const request = new sql.Request();
    request.input("userId", sql.Int, userId);
    const query = `
        SELECT 
        u.*, 
        r.Name AS RoleName, 
        d.Name AS DepartmentName
        FROM [${table}] u
        LEFT JOIN Role r ON u.RoleId = r.Id
        LEFT JOIN Department d ON u.DepartmentId = d.Id
        WHERE u.Id = @userId
      `;
    const result = await request.query(query);
    return result.recordset[0];
  },
  // End of userRoleAndDepartment

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-17-2024
   * PURPOSE/DESCRIPTION  : To get select role and department
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : selectRoleDept
   *****************************************************************/
  async selectRoleDept() {
    const request = new sql.Request();
    const query = `
        SELECT 'Role' AS source, * FROM Role
        UNION ALL
        SELECT 'Department' AS source, * FROM Department;
    `;
    const result = await request.query(query);
    return result.recordset;
  },
  // End of selectRoleDept

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-23-2024
   * PURPOSE/DESCRIPTION  : To get Role with User.Username to be used by SelectController
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : getRoleWithUser
   *****************************************************************/
  async getCreatedUpdatedBy(table) {
    const request = new sql.Request();
    const query = `
        SELECT T.*,
        UC.Username AS CreatedByUsername, 
        UU.Username AS UpdatedByUsername
        FROM [${table}] T
        LEFT JOIN [User] UC ON T.CreatedBy = UC.Id
        LEFT JOIN [User] UU ON T.UpdatedBy = UU.Id
      `;
    const result = await request.query(query);
    return result.recordset;
  },
  // End of getRoleWithUser

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-28-2024
   * PURPOSE/DESCRIPTION  : to get all records from Ticket, Client, User, and Product
   * PROGRAMMER           : Joebert L. Cerezo
   * FUNCTION NAME        : selectTicketClientUserProduct
   *****************************************************************/
  async selectTicketClientUserProduct(table) {
    const request = new sql.Request();
    const query1 = `
        SELECT 
        t.*, 
        p.*, 
        c.*,
        u.*
        FROM 
            ${table} t
        INNER JOIN 
            Product p ON t.ProductId = p.Id
        INNER JOIN 
            Client c ON t.ClientId = c.Id
        INNER JOIN 
            [User] u ON t.CreatedBy = u.Id;
      `;
    const query = `
    SELECT 
        t.*, 
        p.*, 
        c.*,
        (SELECT u1.Firstname + ' ' + u1.Lastname FROM [User] u1 WHERE t.AssignedBy = u1.Id) AS AssignedBy,
        (SELECT u1.Firstname + ' ' + u1.Lastname FROM [User] u1 WHERE t.AnsweredBy = u1.Id) AS AnsweredBy,
        (SELECT u1.Firstname + ' ' + u1.Lastname FROM [User] u1 WHERE t.CreatedBy = u1.Id) AS CreatedBy,
        (SELECT u1.Firstname + ' ' + u1.Lastname FROM [User] u1 WHERE t.UpdatedBy = u1.Id) AS UpdatedBy
    FROM 
        ${table} t
    INNER JOIN 
        Product p ON t.ProductId = p.Id
    INNER JOIN 
        Client c ON t.ClientId = c.Id
      `;
    const result = await request.query(query);
    return result.recordset;
  },
  // End of selectTicketClientUserProduct

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 04-08-2024
   * PURPOSE/DESCRIPTION  : to get single record from Ticket, Client, User, and Product
   * PROGRAMMER           : Joebert L. Cerezo
   * FUNCTION NAME        : selectSingleTicketClientUserProduct
   *****************************************************************/
  async selectSingleTicketClientUserProduct(table, ticketId) {
    const request = new sql.Request();
    const query = `
    SELECT 
        t.*, 
        p.*, 
        c.*,
        (SELECT u1.Firstname + ' ' + u1.Lastname FROM [User] u1 WHERE t.AssignedBy = u1.Id) AS UserAssignedBy,
		    (SELECT u1.Firstname + ' ' + u1.Lastname FROM [User] u1 WHERE t.AnsweredBy = u1.Id) AS UserAnsweredBy,
		    (SELECT u1.Firstname + ' ' + u1.Lastname FROM [User] u1 WHERE t.CreatedBy = u1.Id) AS UserCreatedBy,
		    (SELECT u1.Firstname + ' ' + u1.Lastname FROM [User] u1 WHERE t.UpdatedBy = u1.Id) AS UserUpdatedBy
    FROM 
        ${table} t
    INNER JOIN 
        Product p ON t.ProductId = p.Id
    INNER JOIN 
        Client c ON t.ClientId = c.Id
    WHERE t.Id = ${ticketId}  
      `;
    const result = await request.query(query);
    return result.recordset;
  },
  // End of selectSingleTicketClientUserProduct
};

module.exports = Select;

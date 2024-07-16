const { sql } = require("../config/DbConfig");

const History = {
  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-17-2024
   * PURPOSE/DESCRIPTION  : To get user with role query to be used by SelectController
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : userLeftRole
   *****************************************************************/
  async getHistory(table, userId) {
    const request = new sql.Request();
    request.input("userId", sql.Int, userId);
    const query = `
        SELECT a.*, u.Firstname, u.Lastname, u.Username
        FROM [${table}] a
        LEFT JOIN [User] u ON a.UserId = u.Id
        WHERE a.UserId = @userId
      `;
    const result = await request.query(query);
    return result.recordset;
  },
  // End of getHistory

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-17-2024
   * PURPOSE/DESCRIPTION  : To get user with role query to be used by SelectController
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : userLeftRole
   *****************************************************************/
  async getAllHistory(table) {
    const request = new sql.Request();
    const query = `
        SELECT a.*, u.Firstname, u.Lastname, u.Username
        FROM [${table}] a
        LEFT JOIN [User] u ON a.UserId = u.Id
      `;
    const result = await request.query(query);
    return result.recordset;
  },
  // End of getAllHistory
};

module.exports = History;

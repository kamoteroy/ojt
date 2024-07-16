const sql = require("mssql");

const Notif = {
  async getDeviceToken(userId) {
    const request = new sql.Request();
    const query = `SELECT Tokens FROM DeviceToken WHERE UserId = '${userId}'`;
    const record = await request.query(query);
    return record;
  },

  async getAllDeviceToken() {
    const request = new sql.Request();
    const query = `SELECT UserId, Tokens FROM DeviceToken`;
    const record = await request.query(query);
    return record;
  },

  async getClient() {
    const query = `SELECT * FROM [Client]`;
    const result = await sql.query(query);
    return result.recordset;
  },

  async getTicket() {
    const query = `SELECT TicketNumber FROM [Ticket] WHERE Status = 0`;
    const result = await sql.query(query);
    return result.recordset;
  },

  async getUserToNotify() {
    const query = `SELECT Id FROM [User]`;
    const result = await sql.query(query);
    return result.recordset;
  },

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-17-2024
   * PURPOSE/DESCRIPTION  : To get user with role query to be used by SelectController
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : userLeftRole
   *****************************************************************/
  async getNotify(table, userId) {
    const request = new sql.Request();
    request.input("userId", sql.Int, userId);
    const query = `
        SELECT n.*, u.Firstname, u.Lastname
        FROM [${table}] n
        LEFT JOIN [User] u ON n.UserId = u.Id
        WHERE n.UserId = @userId
      `;
    const result = await request.query(query);
    return result.recordset;
  },
  // End of userLeftRole

  async addToken(userId, token, createdBy, updatedBy) {
    const request = new sql.Request();
    const existingTokens = await this.getDeviceToken(userId);
    const dateToday = new Date();
    dateToday.setUTCHours(dateToday.getUTCHours() + 8);
    const currentDate = dateToday.toISOString().slice(0, 19).replace("T", " ");
    if (existingTokens.recordset.length > 0) {
      const tokens = existingTokens.recordset[0].Tokens.split(",");
      if (!tokens.includes(token)) {
        tokens.push(token);
        const newTokens = tokens.join(",");
        const query = `UPDATE DeviceToken 
                        SET Tokens = '${newTokens}',
                            UpdatedBy = '${updatedBy}',
                            DateUpdated = '${currentDate}'
                        WHERE UserId = '${userId}'`;
        await request.query(query);
      }
    } else {
      const query = `INSERT INTO DeviceToken (UserId, Tokens, CreatedBy, UpdatedBy, DateCreated, DateUpdated) 
                      VALUES ('${userId}', '${token}', '${createdBy}', '${updatedBy}', '${currentDate}', '${currentDate}')`;
      await request.query(query);
    }
  },

  async removeToken(userId, tokenToRemove, updatedBy) {
    const request = new sql.Request();
    const existingTokens = await this.getDeviceToken(userId);
    const dateToday = new Date();
    dateToday.setUTCHours(dateToday.getUTCHours() + 8);
    const currentDate = dateToday.toISOString().slice(0, 19).replace("T", " ");
    if (existingTokens.recordset.length > 0) {
      const tokens = existingTokens.recordset[0].Tokens.split(",");
      const updatedTokens = tokens.filter((token) => token !== tokenToRemove);
      const newTokens = updatedTokens.join(",");
      const query = `UPDATE DeviceToken 
                      SET Tokens = '${newTokens}',
                          UpdatedBy = '${updatedBy}',
                          DateUpdated = '${currentDate}'
                      WHERE UserId = '${userId}'`;
      await request.query(query);
      if (updatedTokens.length === 0) {
        const deleteQuery = `DELETE FROM DeviceToken WHERE UserId = '${userId}'`;
        await request.query(deleteQuery);
      }
    }
  },
};

module.exports = Notif;

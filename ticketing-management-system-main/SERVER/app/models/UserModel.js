const { sql } = require("../config/DbConfig");
const bcrypt = require("bcrypt");
const {
  generateCode,
  generateCodeWithDate,
} = require("../functions/GenerateCode");
const { hashPassword } = require("./AuthModel");

const User = {
  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-25-2024
   * PURPOSE/DESCRIPTION  : To get all record query
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : getAll
   *****************************************************************/
  async getAll(table) {
    const query = `SELECT * FROM [${table}]`;
    const result = await sql.query(query);
    return result.recordset;
  },
  // End of getAll

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-25-2024
   * PURPOSE/DESCRIPTION  : To get specific record query
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : get
   *****************************************************************/
  async get(table, field, data) {
    const request = new sql.Request();
    request.input("data", sql.VarChar, data);
    const query = `SELECT * FROM [${table}] WHERE ${field} = @data`;
    const result = await request.query(query);
    if (table === "Attachment" || table === "TicketLine") {
      return result.recordset;
    }
    return result.recordset[0];
  },
  // End of get

  async getcheck(table, field, data) {
    // default id to null
    const request = new sql.Request();
    request.input("data", sql.VarChar, data);
    let query = `SELECT * FROM [${table}] WHERE ${field} = @data`;

    if (data.id) {
      query += ` AND Id != @id`; // exclude record with the provided id
      request.input("id", sql.Int, id);
    }

    const result = await request.query(query);
    return result.recordset[0];
  },

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 04-21-2024
   * PURPOSE/DESCRIPTION  : To create new record query || Updated TicketReview condition
   * PROGRAMMER           : Sean Cyril B. Rubio || Jay Mar P. Rebanda
   * FUNCTION NAME        : create
   *****************************************************************/
  async create(table, recordData) {
    const request = new sql.Request();
    /* if (table === "Ticket") {
      recordData.TicketNumber = await generateCodeWithDate(table);
    } else if (table === "TicketReview") {
      recordData.TicketReviewNumber = await generateCodeWithDate(table);
    } else {
      recordData.Code = await generateCode(table);
    } */

    const tableToRecordDataProperty = {
      Ticket: "TicketNumber",
      TicketReview: "TicketReviewNumber",
    };

    const property = tableToRecordDataProperty[table] || "Code";
    const generator = tableToRecordDataProperty[table]
      ? generateCodeWithDate
      : generateCode;

    recordData[property] = await generator(table);

    const dateToday = new Date();
    dateToday.setUTCHours(dateToday.getUTCHours() + 8);
    recordData.DateCreated = dateToday
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    recordData.DateUpdated = dateToday
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const columns = Object.keys(recordData).join(", ");
    const values = Object.values(recordData)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ");
    try {
      const query = `INSERT INTO [${table}] (${columns}) OUTPUT INSERTED.Id VALUES (${values})`;
      const result = await request.query(query);
      return result.recordset[0].Id;
    } catch (error) {
      throw error;
    }
  },
  // End of create

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 04-14-2024
   * PURPOSE/DESCRIPTION  : To create new record with no Code field query
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : createNoCode
   *****************************************************************/
  async createNoCode(table, recordData) {
    const request = new sql.Request();
    const dateToday = new Date();
    dateToday.setUTCHours(dateToday.getUTCHours() + 8);
    if (table !== "TicketLine") {
      recordData.DateCreated = dateToday
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    const columns = Object.keys(recordData).join(", ");
    const values = Object.values(recordData)
      .map((value) => {
        if (value === null && recordData.DateFinished === null) {
          return `NULL`;
        } else {
          return typeof value === "string" ? `'${value}'` : value;
        }
      })
      .join(", ");

    try {
      const query = `INSERT INTO [${table}] (${columns}) OUTPUT INSERTED.Id VALUES (${values})`;
      const result = await request.query(query);
      return result.recordset[0].Id;
    } catch (error) {
      throw error;
    }
  },
  // End of createNoCode

  async addRecordToPermissionTable(
    RoleId,
    AccessRightIds,
    CreatedBy,
    UpdatedBy
  ) {
    try {
      const request = new sql.Request();

      const dateToday = new Date();
      dateToday.setUTCHours(dateToday.getUTCHours() + 8);
      const currentDate = dateToday
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const insertedIds = [];

      for (const AccessRightId of AccessRightIds) {
        const code = await generateCode("Permission");

        const query = `
          INSERT INTO Permission (Code, RoleId, AccessRightId, CreatedBy, UpdatedBy, DateCreated, DateUpdated) OUTPUT INSERTED.Id
          VALUES (@Code_${AccessRightId}, @RoleId_${AccessRightId}, @AccessRightId_${AccessRightId}, @CreatedBy_${AccessRightId}, @UpdatedBy_${AccessRightId}, @DateCreated_${AccessRightId}, @DateUpdated_${AccessRightId})
        `;

        request.input(`Code_${AccessRightId}`, sql.NVarChar, code);
        request.input(`RoleId_${AccessRightId}`, sql.Int, RoleId);
        request.input(`AccessRightId_${AccessRightId}`, sql.Int, AccessRightId);
        request.input(`CreatedBy_${AccessRightId}`, sql.Int, CreatedBy);
        request.input(`UpdatedBy_${AccessRightId}`, sql.Int, UpdatedBy);
        request.input(
          `DateCreated_${AccessRightId}`,
          sql.DateTime,
          currentDate
        );
        request.input(
          `DateUpdated_${AccessRightId}`,
          sql.DateTime,
          currentDate
        );

        const result = await request.query(query);
        insertedIds.push(result.recordset[0].Id);
      }

      console.log("Records added to Permission table.");
      return insertedIds;
    } catch (error) {
      console.error("Error adding records to Permission table:", error);
      throw error;
    }
  },

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-26-2024
   * PURPOSE/DESCRIPTION  : To update new record query
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : update
   *****************************************************************/
  async update(table, field, data, updatedData) {
    const request = new sql.Request();
    if (updatedData.Password) {
      updatedData.Password = await hashPassword(updatedData.Password);
    }
    const dateToday = new Date();
    dateToday.setUTCHours(dateToday.getUTCHours() + 8);
    if (table !== "TicketLine" && table !== "Attachment") {
      updatedData.DateUpdated = dateToday
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    /*  const setClause = Object.keys(updatedData)
      .map((key) => `${key} = '${updatedData[key]}'`)
      .join(", ");
 */

    const setClause = Object.keys(updatedData)
      .map((key) => {
        if (key === "DoneDate" && updatedData[key] === null) {
          return `${key} = NULL`;
        } else if (key === "TicketReviewId" && updatedData[key] === null) {
          return `${key} = NULL`;
        } else {
          return `${key} = '${updatedData[key]}'`;
        }
      })
      .join(", ");

    const query = `UPDATE [${table}] SET ${setClause} WHERE ${field} = '${data}'`;
    await request.query(query);
  },
  // End of update

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-26-2024
   * PURPOSE/DESCRIPTION  : To delete all record query
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : deleteAll
   *****************************************************************/
  async deleteAll(table) {
    const request = new sql.Request();
    const query = `DELETE FROM [${table}]`;
    await request.query(query);
  },
  // End of deleteAll

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-26-2024
   * PURPOSE/DESCRIPTION  : To delete specific record query
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : delete
   *****************************************************************/
  async delete(table, field, data) {
    const request = new sql.Request();
    const query = `DELETE FROM [${table}] WHERE ${field} = '${data}'`;
    await request.query(query);
  },
  // End of delete

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-01-2024
   * PURPOSE/DESCRIPTION  : To update password query
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : updatePass
   *****************************************************************/
  async updatePass(table, field, idNo, Password) {
    const hashedPassword = await hashPassword(Password);
    const dateToday = new Date();
    dateToday.setUTCHours(dateToday.getUTCHours() + 8);
    const updatedAt = dateToday.toISOString().slice(0, 19).replace("T", " ");
    const query = `
      UPDATE [${table}]
      SET Password = '${hashedPassword}', DateUpdated = '${updatedAt}'
      WHERE ${field} = '${idNo}'
    `;

    await sql.query(query);
  },
  // End of updatePass

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-09-2024
   * PURPOSE/DESCRIPTION  : To upload Image record query
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : uploadImage
   *****************************************************************/
  async uploadImage(table, field, data, imagePath) {
    const request = new sql.Request();
    const query = `UPDATE [${table}] SET ${field} = '${imagePath}' WHERE Username = '${data}'`;
    await request.query(query);
  },
  // End of uploadImage

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 03-09-2024
   * PURPOSE/DESCRIPTION  : To upload Attachment record query
   * PROGRAMMER           : Joebert L. Cerezo
   * FUNCTION NAME        : uploadAttachment
   *****************************************************************/
  async uploadAttachment(table, recordData) {
    const request = new sql.Request();

    const columns = Object.keys(recordData).join(", ");
    const values = Object.values(recordData)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ");

    try {
      const query = `INSERT INTO [${table}] (${columns}) VALUES (${values})`;
      await request.query(query);
    } catch (error) {
      throw error;
    }
  },
  // End of uploadAttachment
};

module.exports = User;

require("dotenv").config();

const sql = require("mssql");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  generateCode,
  generateCodeWithDate,
} = require("../functions/GenerateCode");
const { generateUniqueRandomNumber } = require("../functions/GeneratePass");
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH = process.env.REFRESH_TOKEN_SECRET;
const ENCRYPTION = process.env.ENCRYPTION_KEY;

const Auth = {
  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-21-2024
   * PURPOSE/DESCRIPTION  : To get user by using Usernamem as the data
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : getUserByUsername
   *****************************************************************/
  async getUserByUsername(table, Username) {
    const request = new sql.Request();
    const query = `SELECT * FROM [${table}] WHERE Username = '${Username}'`;
    const result = await request.query(query);
    return result.recordset.length > 0 ? result.recordset[0] : null;
  },
  // End of getUserByUsername

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-21-2024
   * PURPOSE/DESCRIPTION  : To compare Inputted password with stored hashed password
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : comparePassword
   *****************************************************************/
  async comparePassword(Password, hashedPassword) {
    return await bcrypt.compare(Password, hashedPassword);
  },
  // End of comparePassword

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-21-2024
   * PURPOSE/DESCRIPTION  : To generate new accessToken
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : generateToken
   *****************************************************************/
  async generateToken(user) {
    return jwt.sign({ user }, SECRET, { expiresIn: "30m" });
  },
  // End of generateToken

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-21-2024
   * PURPOSE/DESCRIPTION  : To generate new refreshToken
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : generateRefreshToken
   *****************************************************************/
  async generateRefreshToken(user) {
    return jwt.sign({ user }, REFRESH, { expiresIn: "8h" });
  },
  // End of generateRefreshToken

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-21-2024
   * PURPOSE/DESCRIPTION  : To hashed inputted password
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : hashPassword
   *****************************************************************/
  async hashPassword(Password) {
    const algorithm = "aes-256-cbc";
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(ENCRYPTION, "hex"),
      iv
    );
    let encryptedPassword = cipher.update(Password, "utf8", "hex");
    encryptedPassword += cipher.final("hex");
    return iv.toString("hex") + encryptedPassword;
  },
  // End of hashPassword

  async decryptPassword(encryptedPassword) {
    const iv = Buffer.from(encryptedPassword.slice(0, 32), "hex"); // Extract IV from encrypted data
    const encryptedData = encryptedPassword.slice(32); // Extract encrypted data
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION, "hex"),
      iv
    );
    let decryptedPassword = decipher.update(encryptedData, "hex", "utf8");
    decryptedPassword += decipher.final("utf8");
    return decryptedPassword;
  },

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 02-21-2024
   * PURPOSE/DESCRIPTION  : To create new user
   * PROGRAMMER           : Sean Cyril B. Rubio
   * FUNCTION NAME        : createUser
   *****************************************************************/
  async createUser(table, recordData) {
    const request = new sql.Request();
    if (table === "Ticket") {
      recordData.TicketNumber = await generateCodeWithDate(table);
    } else {
      recordData.Code = await generateCode(table);
    }
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
    const generatepass = "Innosoft-" + recordData.Code;
    recordData.Password = await this.hashPassword(generatepass);

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
  // End of createUser
};

module.exports = Auth;

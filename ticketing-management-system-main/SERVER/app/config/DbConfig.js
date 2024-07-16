require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server:  process.env.DB_SERVER,
  database:  process.env.DB_NAME,
  options: {
    trustedconnection: true,
    encrypt: false,
    instanceName: "MSSQLSERVER" // default instance
  },
  port: 1433,
  dialect: "mssql",
};

async function connectToDB() {
  try {
    await sql.connect(config);
    console.log("Connected to MSSQL server");
  } catch (err) {
    console.error("Error connecting to MSSQL server:", err);
  }
}

module.exports = { connectToDB, sql };

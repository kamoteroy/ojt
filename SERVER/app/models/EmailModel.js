require("dotenv").config();

const nodemailer = require("nodemailer");
const USER = process.env.USER;
const PASS = process.env.APP_PASSWORD;

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-17-2024
 * PURPOSE/DESCRIPTION  : To set Sender of email credentials
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : transporter
 *****************************************************************/
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: USER,
    pass: PASS,
  },
});
// End of transporter

module.exports = transporter;

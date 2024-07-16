const transporter = require("../models/EmailModel");
const err = require("../message/Error.json");
const success = require("../message/Success.json");
const fs = require("fs");
const htmlContent = fs.readFileSync("./app/emailTemplate.html", "utf8");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-19-2024
 * PURPOSE/DESCRIPTION  : To Email from EmailModel
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : sendEmail
 *****************************************************************/
async function sendEmail(req, res) {
  const { to, subject, text } = req.body;
  try {
    const mailOptions = {
      from: {
        name: "Innosoft Cebu",
        address: transporter.options.auth.user,
      },
      to,
      subject,
      text,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).json({ message: success.emailSent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of sendEmail

module.exports = { sendEmail };

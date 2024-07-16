const err = require("../message/Error.json");
/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-16-2024
 * PURPOSE/DESCRIPTION  : To generate unique random number
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : generateUniqueRandomNumber
 *****************************************************************/
async function generateUniqueRandomNumber(req, res) {
  try {
    const min = 10000000;
    const max = 99999999;
    const pattern = Math.floor(Math.random() * (max - min + 1)) + min;
    const generatePass = `Innosoft-${pattern}`;
    console.log(generatePass);
    if (res) {
      return res.status(200).json({ password: generatePass });
    }
    return generatePass;
  } catch (error) {
    res.status(500).json({ message: err.defaultError });
  }
}
// End of generateUniqueRandomNumber

module.exports = { generateUniqueRandomNumber };

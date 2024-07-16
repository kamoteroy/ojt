const User = require("../models/UserModel");
const err = require("../message/Error.json");
const success = require("../message/Success.json");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-01-2024
 * PURPOSE/DESCRIPTION  : To update or change password
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : updatePassword
 *****************************************************************/
exports.updatePassword = async function (req, res) {
  const { table, field, idNo } = req.params;
  const { Password } = req.body;
  try {
    await User.updatePass(table, field, idNo, Password);
    res.status(200).json({ message: success.passUpdated });
  } catch (error) {
    console.error(err.passUpdateError, error);
    res.status(500).json({ message: err.defaultError });
  }
};
// End of updatePassword

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-09-2024
 * PURPOSE/DESCRIPTION  : To get current user logged in
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getCurrentUser
 *****************************************************************/
exports.getCurrentUser = async function (req, res) {
  const { table } = req.params;
  try {
    const results = await User.getAll(table);
    if (results.length === 0) res.status(404).json({ message: err.error404 });
    else {
      res.json(results.filter((result) => result.Id === req.user.user.Id)[0]);
    }
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
};
// End of getCurrentUser

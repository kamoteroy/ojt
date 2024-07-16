const schema = require("../schemas/AuthSchema");
const Auth = require("../models/AuthModel");
const { isRecordExist } = require("../functions/CheckRecord");
const err = require("../message/Error.json");
const success = require("../message/Success.json");
const { get } = require("../models/UserModel");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-21-2024
 * PURPOSE/DESCRIPTION  : To Login User Credential
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : loginUser
 *****************************************************************/
async function loginUser(req, res) {
  try {
    const { table } = req.params;
    const { Username, Password } = req.body;
    const { error } = schema.loginSchema.validate({ Username, Password });
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const user = await Auth.getUserByUsername(table, Username);
    console.log("User Ni", user);
    if (user.isDeactivated == 1) {
      return res
        .status(401)
        .json({ Login: false, message: err.accountDisabled });
    }

    if (user) {
      const decryptedPassword = await Auth.decryptPassword(user.Password);
      if (Password === decryptedPassword) {
        const accessToken = await Auth.generateToken(user);
        const refreshToken = await Auth.generateRefreshToken(user);

        return (
          res
            // .cookie("accessToken", accessToken, {
            //   httpOnly: true,
            // })
            // .cookie("refreshToken", refreshToken, {
            //   httpOnly: true,
            //   sameSite: "strict",
            // })
            .header("Authorization", accessToken)
            .header("Refresh-Token", refreshToken)
            .json({
              Login: true,
              message: success.login,
              user,
              accessToken,
              refreshToken,
            })
        );
      } else res.status(401).json({ Login: false, message: err.invalidPass });
    } else res.status(401).json({ Login: false, message: err.invalidUsername });
  } catch (error) {
    res.status(500).json({ message: err.defaultError });
  }
}
// End of loginUser

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-01-2024
 * PURPOSE/DESCRIPTION  : To Add New User in the database
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : addNewUser
 *****************************************************************/
async function addNewUser(req, res) {
  const { table } = req.params;
  const recordData = req.body;
  const { error } = schema.registerSchema.validate(recordData);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const record = await isRecordExist(table, recordData);
  if (!record) {
    try {
      const newUserId = await Auth.createUser(table, recordData);
      res.status(201).json({ message: success.added, Id: newUserId });
    } catch (error) {
      console.error(err.addError, error);
      res.status(500).json({ message: err.defaultError });
    }
  } else {
    res.status(500).json({ message: err.alreadyExist });
  }
}
// End of addNewUser

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-16-2024
 * PURPOSE/DESCRIPTION  : To Decrypt User Password
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : decrypt
 *****************************************************************/
async function decrypt(req, res) {
  const { Id } = req.params;
  try {
    const getResponse = await get("User", "Id", Id);
    const decryptPass = await Auth.decryptPassword(getResponse.Password);
    return res.status(200).json({ decryptedPassword: decryptPass });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: err.defaultError });
  }
}
// End of Decrypt

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-21-2024
 * PURPOSE/DESCRIPTION  : To logout user if cookie is used instead of localforage
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : logout
 *****************************************************************/
async function logout(req, res) {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ success: true, message: success.logout });
  } catch (error) {
    return res.status(500).json({ message: err.defaultError });
  }
}
// End of logout

module.exports = {
  loginUser,
  logout,
  addNewUser,
  decrypt,
};

require("dotenv").config();

const jwt = require("jsonwebtoken");
const err = require("../message/Error.json");
const {
  getUserRolePermissions,
  getRequiredPermission,
} = require("../functions/PermissionHandler");
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH = process.env.REFRESH_TOKEN_SECRET;

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-18-2024
 * PURPOSE/DESCRIPTION  : To verify accessToken validation and expiration
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : verifyToken
 *****************************************************************/
const verifyToken = (req, res, next) => {
  // const accessToken = req.cookies.accessToken;
  // const refreshToken = req.cookies.refreshToken;
  const accessToken = req.headers.authorization;
  const refreshToken = req.headers["refresh-token"];

  if (!accessToken) {
    return res.json({ valid: false, message: err.tokenFailed });
  } else {
    jwt.verify(accessToken, SECRET, async (error, user) => {
      if (error) {
        return refresh(req, res, next);
      } else {
        const userId = user.user.Id;
        const userPermissions = await getUserRolePermissions(userId);
        req.userPermissions = userPermissions;

        const excludedRoutes = [
          "/verify",
          "/refresh",
          "/generatepass",
          "/getcurrentuser",
          "/getroledept",
          "/sendemail",
          "/decrypt",
          "/logout",
          "/addaudit",
          "/getaudit",
          "/addrecordnocode",
          "/updatepassword",
          "/updaterecord/Notification",
          "/deleterecord/Notification",
        ];

        if (excludedRoutes.some((route) => req.path.startsWith(route))) {
          req.user = user;
          req.accessToken = accessToken;
          req.refreshToken = refreshToken;
          return next();
        }

        if (!userPermissions) {
          return res
            .status(403)
            .json({ valid: false, message: err.permission404 });
        }

        const { table } = req.params;
        const { method } = req;
        const endpoint = "/" + req.path.split("/")[1];
        const requiredPermission = getRequiredPermission(
          table,
          endpoint,
          method
        );

        if (!userPermissions.includes(requiredPermission)) {
          return res
            .status(403)
            .json({ valid: false, message: err.unauthorize });
        }

        req.user = user;
        req.accessToken = accessToken;
        req.refreshToken = refreshToken;
        next();
      }
    });
  }
};
// End of verifyToken

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-08-2024
 * PURPOSE/DESCRIPTION  : To refresh accessToken if expired
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : refresh
 *****************************************************************/
const refresh = (req, res, next) => {
  // const refreshToken = req.cookies.refreshToken;
  const refreshToken = req.headers["refresh-token"];
  console.log("ANOTHER REFRESH", refreshToken);
  if (!refreshToken) {
    return res.json({ valid: false, message: err.noToken });
  } else {
    jwt.verify(refreshToken, REFRESH, (error, user) => {
      if (error) {
        return res.json({ valid: false, message: err.tokenFailed });
      } else {
        delete user.iat;
        delete user.exp;
        const newAccessToken = jwt.sign(user, SECRET, { expiresIn: "1d" });
        console.log("ANOTHER ACCESS", newAccessToken);
        // res.cookie("accessToken", accessToken);
        req.accessToken = newAccessToken;
        req.refreshToken = refreshToken;
        res.setHeader("Authorization", newAccessToken);
        next();
      }
    });
  }
};
// End of refresh

module.exports = { verifyToken };

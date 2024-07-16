const express = require("express");
const router = express.Router();
const path = require("path");
const record = require("../controllers/RecordController");
const report = require("../controllers/ReportController");
const auth = require("../controllers/AuthController");
const user = require("../controllers/UserController");
const join = require("../controllers/SelectController");
const generate = require("../functions/GeneratePass");
const email = require("../controllers/EmailController");
const {
  upload,
  uploadImage,
  uploadMultipleAttachment,
  deleteImage,
} = require("../functions/UploadImage");
const success = require("../message/Success.json");
const { verifyToken } = require("../middleware/VerifyToken");
const notify = require("../controllers/NotificationController");
const audit = require("../controllers/HistoryController");
const { generateToken, generateRefreshToken } = require("../models/AuthModel");

// RecordController.js
router.get("/getallrecord/:table", record.getAllRecord);
router.get("/getrecord/:table/:field/:data", record.getRecord);
router.post("/addrecord/:table", record.addRecord);
router.post("/addmultiplerecord/:table", record.addMultipleRecord);
//router.post("/addrecord/:table", record.addRecord);
router.post("/addrecordnocode/:table", verifyToken, record.addRecordNoCode);
router.post("/addmultiplerecord/:table", record.addMultipleRecord);
router.post("/addmultiplepermission", record.addMultiplePermissionRecord);
router.put("/updaterecord/:table/:field/:data", record.updateRecord);
router.delete("/deleteallrecord/:table", record.deleteAllRecord);
router.delete(
  "/deleterecord/:table/:field/:data",
  verifyToken,
  record.deleteRecord
);
router.post(
  "/uploadimage/:table/:field/:data",
  upload.single("image"),
  uploadImage
);
router.post(
  "/uploadattachment/:table",
  upload.array("image"),
  uploadMultipleAttachment
);
router.get("/deleteimage/:table/:field/:data", deleteImage);
router.get("/images/:imageName", (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, "..", "public", "images", imageName);
  res.sendFile(imagePath);
});
router.post("/addaudit/:table", record.addRecordNoCode);
router.get("/getaudit/:table/:userId", audit.getAuditTrail);
router.get("/getallaudit/:table", verifyToken, audit.getAllAuditTrail);

// SelectController.js
router.get("/getuserleftrole/:table", verifyToken, join.getUserLeftRole);
router.get(
  "/getuserroledept/:table/:userId",
  verifyToken,
  join.getUserRoleAndDepartment
);
router.get("/getroledept", verifyToken, join.getSelectRoleDepartment);
router.get(
  "/getcreatedupdatedby/:table",
  verifyToken,
  join.getCreatedUpdatedBy
);
router.get(
  "/getticketclientuserproduct/:table",
  verifyToken,
  join.getTicketClientUserProduct
);
router.get(
  "/getsingleticketclientuserproduct/:table/:ticketId",
  verifyToken,
  join.getSingleTicketClientUserProduct
);
router.get("/getrolepermissions/:roleId", join.getPermission);

// not working getexcludedaccessrights api
router.get("/getexcludedaccessrights/:roleId", join.getExcludedAccessRights);

router.get("/getRemainingAccessRights/:roleId", join.getRemainingAccessRights);

// UserController.js
router.put(
  "/updatepassword/:table/:field/:idNo",
  verifyToken,
  user.updatePassword
);
router.get("/getcurrentuser/:table", verifyToken, user.getCurrentUser);

// Email Controller.js
router.post("/sendemail", verifyToken, email.sendEmail);

// Notification Controller.js
router.get("/getnotification/:table/:userId", notify.getNotification);
router.post("/sendallnotification", notify.sendNotification);
router.post("/sendnotification", notify.sendUserNotification);
router.post("/checkfcmtoken/:userId", notify.getFcmToken);
router.post("/subscribe", notify.subscribe);
router.post("/unsubscribe", notify.unsubscribe);
router.post("/addnotification/:table", record.addRecordNoCode);

// AuthController routes
router.get("/generatepass", verifyToken, generate.generateUniqueRandomNumber);
router.post("/createuser/:table", verifyToken, auth.addNewUser);
router.post("/login/:table", auth.loginUser);
router.get("/decrypt/:Id", verifyToken, auth.decrypt);
router.post("/logout", verifyToken, auth.logout);

// Verify Token
router.get("/verify", verifyToken, (req, res) => {
  const permissions = req.userPermissions;
  try {
    return res.json({
      valid: true,
      message: "authorized",
      accessToken: req.accessToken,
      refreshToken: req.refreshToken,
      permission: permissions,
    });
  } catch (error) {
    throw error;
  }
});

//refresh
router.get("/refresh", verifyToken, async (req, res) => {
  try {
    const user = req.user.user;
    const accessToken = await generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    res
      .header("Authorization", accessToken)
      .header("Refresh-Token", refreshToken)
      .json({
        Login: true,
        message: success.login,
        user,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    res.status(500).json({ message: "Error refreshing tokens" });
  }
});

//reports
router.get("/getRecordCount/:table", verifyToken, report.getTicketReports);
router.get(
  "/getMonthlyRecordCount/:table",
  verifyToken,
  report.getMonthlyTicketReports
);
router.get("/getAvgCount/:table", verifyToken, report.getAvgRate);

//reports by Id
router.get("/getRecordCountById/:table/:id", report.getTicketReportsById);
router.get(
  "/getMonthlyRecordCountById/:table/:id",
  report.getMonthlyTicketReportsById
);
router.get("/getAvgCountById/:table/:id", report.getAvgRateById);

module.exports = router;

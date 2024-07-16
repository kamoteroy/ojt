require("dotenv").config();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const err = require("../message/Error.json");
const success = require("../message/Success.json");
const Notif = require("../models/NotificationModel");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
let accessToken = null;
const fetchAccessToken = async () => {
  if (accessToken && accessToken.expiresAt > Date.now()) {
    return accessToken.token;
  }
  const jwtPayload = {
    iss: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const signedJWT = jwt.sign(jwtPayload, privateKey, { algorithm: "RS256" });

  try {
    const res = await axios.post("https://oauth2.googleapis.com/token", {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJWT,
    });
    accessToken = {
      token: res.data.access_token,
      expiresAt: Date.now() + res.data.expires_in * 1000,
    };

    console.log("Access Token", accessToken.token);
    return accessToken.token;
  } catch (error) {
    console.error(err.notifAccessErr, error.message);
    return null;
  }
};

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-14-2024
 * PURPOSE/DESCRIPTION  : To get notification details from NotificationModel
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getNotification
 *****************************************************************/
async function getNotification(req, res) {
  const { table, userId } = req.params;
  try {
    const result = await Notif.getNotify(table, userId);
    // if (result.length === 0) res.status(200).json({ message: err.error404 });
    res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getNotification

const sendNotification = async (req, res) => {
  const messageData = req.body;
  let responseArray = [];
  try {
    const accessToken = await fetchAccessToken();
    const tokensResult = await Notif.getAllDeviceToken();

    for (const record of tokensResult.recordset) {
      const tokensArray = record.Tokens.split(",");
      const userId = record.UserId;
      for (const token of tokensArray) {
        messageData.message.token = token;
        messageData.message.data.userId = `${userId}`;
        messageData.message.data.description =
          messageData.message.notification.body;
        console.log("MESSAGE DATA", token);
        console.log(messageData);
        try {
          const notifResponse = await axios.post(
            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
            messageData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          responseArray.push(messageData);
        } catch (error) {
          console.error("Error sending notification:", error.message);
          await Notif.removeToken(userId, token, userId);
          console.log(`Invalid token ${token} removed for user ${userId}`);
        }
      }
    }
    res.json(responseArray);
  } catch (error) {
    console.error(err.notifMessErr, error.message);
    res.status(500).json({ message: err.notifSendErr });
  }
};

const sendUserNotification = async (req, res) => {
  const messageData = req.body;
  let responseArray = [];
  try {
    const accessToken = await fetchAccessToken();
    const userId = messageData.message.data.userId;
    console.log("User Id", userId);
    const tokensResult = await Notif.getDeviceToken(userId);
    console.log("DATA", tokensResult);
    if (tokensResult.recordset.length > 0) {
      const tokensArray = tokensResult.recordset[0].Tokens.split(",");

      for (const token of tokensArray) {
        messageData.message.token = token;
        messageData.message.data.description =
          messageData.message.notification.body;
        console.log(messageData);
        try {
          await axios.post(
            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
            messageData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          responseArray.push(messageData);
        } catch (error) {
          console.error("Error sending notification:", error.message);
          await Notif.removeToken(userId, token, userId);
          console.log(`Invalid token ${token} removed for user ${userId}`);
        }
      }
    }
    res.json(responseArray);
  } catch (error) {
    console.error(err.notifMessErr, error.message);
    res.status(500).json({ message: err.notifSendErr });
  }
};

async function getFcmToken(req, res) {
  const { userId } = req.params;
  const { currentToken } = req.body;
  try {
    const tokensResult = await Notif.getDeviceToken(userId);
    if (tokensResult.recordset.length > 0) {
      const tokensArray = tokensResult.recordset[0].Tokens.split(",");
      const tokenExists = tokensArray.includes(currentToken);

      if (tokenExists) {
        res.status(200).json({ exists: true });
      } else {
        res.status(200).json({ exists: false });
      }
    } else {
      res.status(200).json({ message: "User has no FCM tokens" });
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function subscribe(req, res) {
  const { UserId, Tokens, CreatedBy, UpdatedBy } = req.body;

  try {
    await Notif.addToken(UserId, Tokens, CreatedBy, UpdatedBy);
    res.status(200).json({ message: success.subscribed });
  } catch (error) {
    console.error(err.subError, error);
    res.status(500).json({ message: err.defaultError });
  }
}

async function unsubscribe(req, res) {
  const { UserId, Tokens, UpdatedBy } = req.body;

  try {
    await Notif.removeToken(UserId, Tokens, UpdatedBy);
    res.status(200).json({ message: success.unsubscribed });
  } catch (error) {
    console.error(err.unsubError, error);
    res.status(500).json({ message: err.defaultError });
  }
}

module.exports = {
  fetchAccessToken,
  sendNotification,
  sendUserNotification,
  getFcmToken,
  getNotification,
  subscribe,
  unsubscribe,
};

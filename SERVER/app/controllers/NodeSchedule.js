const sql = require("mssql");
const schedule = require("node-schedule");
const Notif = require("../models/NotificationModel");
const success = require("../message/Success.json");
const err = require("../message/Error.json");
const { fetchAccessToken } = require("./NotificationController");
const axios = require("axios");
const User = require("../models/UserModel");

const projectId = process.env.FIREBASE_PROJECT_ID;

const addNotification = async (UserId, Description, LinkedComponent) => {
  const recordData = {
    UserId,
    Description,
    LinkedComponent,
    Status: 0,
  };
  await User.createNoCode("Notification", recordData);
};

const sendClientNotification = async () => {
  let responseArray = [];
  try {
    const accessToken = await fetchAccessToken();
    const tokensResult = await Notif.getAllDeviceToken();
    const users = await Notif.getUserToNotify();
    const clients = await Notif.getClient();
    const currentDate = new Date();

    for (const client of clients) {
      const bcsExpiryDate = new Date(client.DateBCSExpiry);
      const bcsExpiryMonth = bcsExpiryDate.getMonth() - 1;
      const bcsExpiryDay = bcsExpiryDate.getDate();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();

      if (currentMonth === bcsExpiryMonth && currentDay === bcsExpiryDay) {
        const clientCode = client.Code;
        const messageData = {
          message: {
            notification: {
              title: "Cebu Innosoft Solutions Services Inc.",
              body: `Client ${clientCode} BCS is expiring in one month. Please renew subscription.`,
            },
            data: {
              click_action: "/clients",
            },
          },
        };
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
              await addNotification(
                messageData.message.data.userId,
                messageData.message.data.description,
                messageData.message.data.click_action
              );
              responseArray.push(messageData);
            } catch (error) {
              console.error("Error sending notification:", error.message);
              await Notif.removeToken(userId, token, userId);
              console.log(`Invalid token ${token} removed for user ${userId}`);
            }
          }
        }
        for (const user of users) {
          console.log("USER BAKAMO", user.Id);
          await addNotification(
            user.Id,
            messageData.message.notification.body,
            messageData.message.data.click_action
          );
        }
      }
    }
    console.log(responseArray);
  } catch (error) {
    console.error(err.notifMessErr, error.message);
  }
};

const sendEODNotification = async () => {
  let responseArray = [];
  try {
    const accessToken = await fetchAccessToken();
    const tokensResult = await Notif.getAllDeviceToken();
    const users = await Notif.getUserToNotify();
    const unresolvedTickets = await Notif.getTicket();
    console.log("TICKETS LENGTH", unresolvedTickets.length);
    let tickets = [];
    for (const unresolvedTicket of unresolvedTickets) {
      console.log("ticket", unresolvedTicket);
      tickets.push(unresolvedTicket.TicketNumber);
    }
    const messageData = {
      message: {
        notification: {
          title: "Cebu Innosoft Solutions Services Inc.",
          body: `End of Day Notification! ${
            unresolvedTickets.length > 0
              ? "There are still unresolved tickets!"
              : "All tickets Solved!"
          }`,
        },
        data: {
          click_action: "/tickets",
        },
      },
    };
    for (const record of tokensResult.recordset) {
      const tokensArray = record.Tokens.split(",");
      const userId = record.UserId;
      console.log("asdad", tickets);
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
    console.log(responseArray);
    for (const user of users) {
      console.log("USER BAKAMO", user.Id);
      await addNotification(
        user.Id,
        messageData.message.notification.body,
        messageData.message.data.click_action
      );
    }
  } catch (error) {
    console.error(err.notifMessErr, error.message);
  }
};

schedule.scheduleJob("30 9 * * 1-7", async () => {
  console.log("Scheduling notifications for clients...");
  await sendClientNotification();
});

schedule.scheduleJob("30 17 * * 1-6", async () => {
  console.log("Scheduling notifications for clients...");
  await sendEODNotification();
});

// schedule.scheduleJob("9 21 * * 1-6", async () => {
//   console.log("Scheduling notifications for clients...");
//   await sendNotification({
//     message: {
//       notification: {
//         title: "Cebu Innosoft Solutions Services Inc.",
//         body: "Your BCS is expiring in one month. Please renew your subscription.",
//       },
//       data: {
//         click_action: "/notification",
//       },
//     },
//   });
// });

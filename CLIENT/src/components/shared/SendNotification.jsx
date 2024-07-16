import axiosInstance from "./axiosInstance";

export const sendAllNotification = async (Description, LinkedComponent) => {
  try {
    const response = await axiosInstance.post(`/sendallnotification`, {
      message: {
        notification: {
          title: "Cebu Innosoft Solutions Services Inc.",
          body: Description,
        },
        data: {
          click_action: LinkedComponent,
        },
      },
    });
    const notifications = response.data;
    console.log(notifications);
    for (const notification of notifications) {
      console.log(notification);
      const addResponse = await axiosInstance.post(
        "/addnotification/Notification",
        {
          UserId: notification.message.data.userId,
          Description: notification.message.data.description,
          LinkedComponent: notification.message.data.click_action,
          Status: 0,
        }
      );
      console.log(addResponse.data);
    }
  } catch (error) {
    console.error("Error sending notification data:", error);
    throw error;
  }
};

export const sendNotification = async (
  UserId,
  Description,
  LinkedComponent
) => {
  try {
    const getresponse = await axiosInstance.get(
      `/getrecord/DeviceToken/UserId/${UserId}`
    );
    if (!getresponse.data.message) {
      await axiosInstance.post(`/sendnotification`, {
        message: {
          notification: {
            title: "Cebu Innosoft Solutions Services Inc.",
            body: Description,
          },
          data: {
            click_action: LinkedComponent,
            userId: `${UserId}`,
          },
        },
      });
    }
    const addResponse = await axiosInstance.post(
      "/addnotification/Notification",
      {
        UserId: UserId,
        Description: Description,
        LinkedComponent: LinkedComponent,
        Status: 0,
      }
    );
    console.log(addResponse.data);
  } catch (error) {
    console.error("Error sending notification data:", error);
  }
};

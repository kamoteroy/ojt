// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  deleteToken,
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";
import AuthToken from "../auth/AuthToken";
import axiosInstance from "../components/shared/axiosInstance";
import localforage from "localforage";
import { clearFirebaseMessagingStore } from "../components/shared/FirebaseUtils";
import { toast } from "react-toastify";
import notifySrc from "../assets/audio/notify.mp3";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOAvjiFa0BI6eDw5DVgn3_9vSFLHvBxXo",
  authDomain: "innosoft-tms.firebaseapp.com",
  projectId: "innosoft-tms",
  storageBucket: "innosoft-tms.appspot.com",
  messagingSenderId: "242132435713",
  appId: "1:242132435713:web:3b0fef9ac76cbb7d169100",
  measurementId: "G-LQ8PXKH3VS",
};
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
export let currentFcmToken;
export const requestPermission = async () => {
  const { Id } = await AuthToken.getCurrentUser();

  if (Id) {
    //     console.log("Requesting User Permission.....");
    //     await Notification.requestPermission().then(async (permission) => {
    //       if (permission === "granted") {
    const oldToken = await localforage.getItem("fcmToken");
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js", { scope: "/" })
      .then(async (registration) => {
        try {
          if (oldToken) {
            clearFirebaseMessagingStore().then((message) =>
              console.log(message)
            );
            await deleteToken(messaging, oldToken);
            // console.log("Old FCM token deleted successfully");
          }
          // navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          //   scope: "/firebase-cloud-messaging-push-scope",
          // });

          return getToken(messaging, {
            serviceWorkerRegistration: registration,
            vapidKey:
              "BK4KS5caygfINcIubU01SvnC-ZPDtZ0txP6tzxiP7lN6stUGNqPYl-MBPjCkRFGLbn1KG7FLnE-mkRZXm-k1_bM",
          })
            .then(async (currentToken) => {
              console.log("Notification User Permission Granted.");
              if (currentToken) {
                currentFcmToken = currentToken;
                if (oldToken) {
                  try {
                    await axiosInstance.post(`/unsubscribe`, {
                      UserId: Id,
                      Tokens: oldToken,
                      UpdatedBy: Id,
                    });
                  } catch (error) {
                    console.error("Error deleting old FCM token:", error);
                  }
                }
                try {
                  await axiosInstance.post(`/subscribe`, {
                    UserId: Id,
                    Tokens: currentFcmToken,
                    CreatedBy: Id,
                    UpdatedBy: Id,
                  });
                  localforage.setItem("fcmToken", currentFcmToken);
                } catch (error) {
                  console.error("Error storing FCM token:", error);
                }
              } else {
                console.log("Failed to generate the app registration token.");
              }
            })
            .catch((err) => {
              console.log("Permission Denied");
            });
        } catch (error) {
          console.error("An error occured", error);
        }
      });
    //       } else {
    //         console.log("User Permission Denied.");
    //       }
    //     });
  } else {
    console.log("No user is logged in.");
  }
};
requestPermission();

// export const onMessageListener = () =>
//   new Promise((resolve) => {
//     onMessage(messaging, (payload) => {
//       resolve(payload);
//     });
//   });

export const onMessageListener = (navigate) =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);

      const notificationTitle = payload.notification.title;
      const notificationBody = payload.notification.body;

      toast.info(`${notificationBody}`, {
        onOpen: () => {
          const audio = new Audio(notifySrc);
          audio.play().catch((error) => {
            console.log("Browser do not support autoplay");
          });
        },
        toastId: "notification",
        position: "top-center",
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => {
          navigate(payload.data.click_action);
        },
      });

      resolve(payload);
    });
  });

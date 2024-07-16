importScripts(
  "https://www.gstatic.com/firebasejs/10.6.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCOAvjiFa0BI6eDw5DVgn3_9vSFLHvBxXo",
  authDomain: "innosoft-tms.firebaseapp.com",
  projectId: "innosoft-tms",
  storageBucket: "innosoft-tms.appspot.com",
  messagingSenderId: "242132435713",
  appId: "1:242132435713:web:3b0fef9ac76cbb7d169100",
  measurementId: "G-LQ8PXKH3VS",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/inno-logo.png",
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const payload = event.notification.data;
  if (payload && payload.linkedComponent) {
    event.waitUntil(clients.openWindow(payload.linkedComponent));
  }
});

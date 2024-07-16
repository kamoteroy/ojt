export function clearFirebaseMessagingStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("firebase-messaging-database");

    request.onerror = function (event) {
      reject(new Error("Error opening IndexedDB: " + event.target.error));
    };

    request.onsuccess = function (event) {
      const db = event.target.result;

      const transaction = db.transaction(
        ["firebase-messaging-store"],
        "readwrite"
      );
      const store = transaction.objectStore("firebase-messaging-store");

      const clearRequest = store.clear();

      clearRequest.onsuccess = function (event) {
        resolve("Firebase Messaging Store cleared successfully");
      };

      clearRequest.onerror = function (event) {
        reject(
          new Error(
            "Error clearing Firebase Messaging Store: " + event.target.error
          )
        );
      };
    };
  });
}

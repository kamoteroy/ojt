import React, { useEffect } from "react";
import { CurrentUserProvider } from "./auth/CurrentUserContext";
import Routing from "./routes/Routing";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onMessageListener } from "./firebase/firebase";

function App() {
  return (
    <CurrentUserProvider>
      <Routing />
    </CurrentUserProvider>
  );
}

export default App;

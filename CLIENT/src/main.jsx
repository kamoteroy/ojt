import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { NextUIProvider } from "@nextui-org/react";
import "./styles/globals.css";
//import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
//import userReducer from "./routes/userLogged.jsx";
import { PersistGate } from "redux-persist/integration/react";
import store, { Persistor } from "./routes/store.js";

/*const store = configureStore({
  reducer: {
    user: userReducer,
  },
});*/

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={Persistor}>
        <NextUIProvider>
          <main className="innosoft-light text-foreground bg-background h-screen">
            <App />
          </main>
        </NextUIProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { NextUIProvider } from "@nextui-org/react";
import "./styles/globals.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { Persistor } from "./routes/store.js";

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

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { NextUIProvider } from "@nextui-org/react";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NextUIProvider>
      <main className="innosoft-light text-foreground bg-background h-screen">
        <App />
      </main>
    </NextUIProvider>
  </React.StrictMode>
);

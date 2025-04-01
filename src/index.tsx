import React from "react";
import * as ReactDOMClient from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOMClient.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

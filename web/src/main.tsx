import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { OpenInSafariGate } from "./components/OpenInSafariGate";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OpenInSafariGate>
      <App />
    </OpenInSafariGate>
  </React.StrictMode>,
);

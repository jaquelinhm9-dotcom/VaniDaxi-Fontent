import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./styles.css";

const redirectPath = new URLSearchParams(window.location.search).get("p");

if (redirectPath) {
  window.history.replaceState(
    null,
    "",
    `/VaniDaxi-Fontent${redirectPath}`
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/VaniDaxi-Fontent">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

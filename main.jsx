import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./styles.css";

const redirectPath = new URLSearchParams(window.location.search).get("p");
if (redirectPath) {
  window.history.replaceState(null, "", `/VaniDaxi-frontend${redirectPath}`);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/VaniDaxi-frontend">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

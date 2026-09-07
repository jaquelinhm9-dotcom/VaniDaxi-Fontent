import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ReferenceMobileNav from "./ReferenceMobileNav.jsx";
import "./styles.css";
import "./reference-mobile.css";
import "./reference-mobile-final.css";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const redirectPath = new URLSearchParams(window.location.search).get("p");

if (redirectPath) {
  const cleanPath = redirectPath.startsWith("/")
    ? redirectPath
    : `/${redirectPath}`;

  window.history.replaceState(
    {},
    "",
    `${base}${cleanPath}${window.location.hash}`
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={base}>
      <App />
      <ReferenceMobileNav />
    </BrowserRouter>
  </React.StrictMode>
);

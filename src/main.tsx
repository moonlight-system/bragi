import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isAndroid } from "./types_and_functions";

document.documentElement.dataset.platform = isAndroid ? "mobile" : "desktop";

// apply the saved theme before the first render, to avoid flashing the default one
try {
  const saved = JSON.parse(localStorage.getItem("bragi-colors") ?? "{}");
  for (const [variable, value] of Object.entries(saved)) {
    if (variable.startsWith("--")) {
      document.documentElement.style.setProperty(variable, value as string);
    }
  }
} catch {}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

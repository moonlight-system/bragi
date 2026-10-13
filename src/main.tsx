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

if (isAndroid) {
  // the keyboard is open when the visible area is much shorter than the layout
  const keyboardOpen = () =>
    (window.visualViewport?.height ?? window.innerHeight) < window.innerHeight - 100;

  // while it is, dragging would pan the visible area over the layout: cancel the drag
  document.addEventListener(
    "touchmove",
    (e) => { if (keyboardOpen()) e.preventDefault(); },
    { passive: false }
  );
}

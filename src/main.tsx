import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isAndroid } from "./types_and_functions";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/lexend/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/nunito/400.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/comic-neue/400.css";
import "@fontsource/opendyslexic/400.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/vt323/400.css";
import "@fontsource/silkscreen/400.css";
import "@fontsource/press-start-2p/400.css";
import { applyFont, DEFAULT_FONT } from "./fonts";

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

try {
  applyFont(localStorage.getItem("bragi-font") ?? DEFAULT_FONT);
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

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Benign browser warning (fired by dialogs/selects resizing); never treat it as a crash.
const isResizeObserverNoise = (msg?: string) =>
  !!msg && msg.includes("ResizeObserver loop");

window.addEventListener("error", (e) => {
  if (isResizeObserverNoise(e.message)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);

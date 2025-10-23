import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Sicherheitsnetz: React braucht ein Root-Element, sonst Blocker werfen.
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root-Element nicht gefunden");
}

// StrictMode sorgt für zusätzliche Checks in der Entwicklung (z. B. doppelte Effects).
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA-Unterstützung: registriert den Service Worker, sobald die Seite geladen wurde.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const serviceWorkerUrl = `${basePath}/service-worker.js`;
    navigator.serviceWorker
      .register(serviceWorkerUrl)
      .catch((error) => console.error("Service Worker Registrierung fehlgeschlagen:", error));
  });
}

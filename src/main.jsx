import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
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
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// PWA-Unterstützung: registriert den Service Worker, sobald die Seite geladen wurde.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    try {
      const baseUrl = new URL(import.meta.env.BASE_URL ?? "/", window.location.href);
      const serviceWorkerUrl = new URL("service-worker.js", baseUrl);
      const scopeUrl = new URL(".", baseUrl);
      navigator.serviceWorker
        .register(serviceWorkerUrl.href, { scope: scopeUrl.href })
        .catch((error) => console.error("Service Worker Registrierung fehlgeschlagen:", error));
    } catch (error) {
      console.error("Service Worker konnte nicht initialisiert werden:", error);
    }
  });
}

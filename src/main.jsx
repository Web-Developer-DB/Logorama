/**
 * @file main.jsx
 * @description Einstiegspunkt der React-PWA. Initialisiert den Root-Renderer,
 * versieht den Baum mit StrictMode, bindet den HashRouter ein und registriert
 * nach dem Laden den Service Worker für Offline-Support.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

// Sicherheitsnetz: React braucht ein Root-Element, sonst stoppen wir mit einer klaren Fehlermeldung.
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root-Element nicht gefunden");
}

// StrictMode sorgt für zusätzliche Checks in der Entwicklung (z. B. doppelte Effects).
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// PWA-Unterstützung: Registriert den Service Worker, sobald die Seite geladen wurde.
// Die Hash-Routing-Variante benötigt besondere Sorgfalt beim Scope, daher werden URLs jeden Aufrufs normalisiert.
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

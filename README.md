# Logorama

Logorama ist ein persönliches Log als Progressive Web App. Die Anwendung läuft komplett offline, speichert Einträge lokal im Browser und lässt sich auf Android (und anderen Plattformen mit PWA-Unterstützung) wie eine native App installieren. Export und Import funktionieren über JSON-Dateien, um Backups zu erstellen oder Daten zwischen Geräten zu übertragen.

## Highlights

- 🌟 Modernes UI mit Dark/Light-Unterstützung und mobiloptimierter Oberfläche
- 📝 Freitext-Log inkl. Datum/Uhrzeit, Suchfunktion sowie Filter für „Heute“ und „Letzte 7 Tage“
- 💾 Persistenz über `localStorage`, optionaler JSON-Import/-Export
- 🗑️ Papierkorb mit 30 Tagen Aufbewahrungsfrist und Restore-Option
- 📂 Export fragt (sofern vom Browser unterstützt) nach Zielordner via File System Access API
- 📦 Vite + React 18 Setup für schnelle Builds und moderne DX
- 📱 PWA-ready: Manifest, maskierbares Icon, Service Worker, Android-Installationsbereitschaft

## Technologie-Stack

- React 18 (`createRoot`, Hooks)
- Vite 5 mit `@vitejs/plugin-react`
- Vanilla CSS (Google Fonts, responsive Breakpoints, Glas-Effekt)
- PWA-Komponenten: Web App Manifest, Service Worker, lokale Assets

## Erste Schritte

```bash
npm install
npm run dev
```

Der Dev-Server ist standardmäßig unter `http://localhost:5173` erreichbar. Hot Module Replacement ist aktiviert.

### Build & Preview

```bash
npm run build     # erzeugt Produktions-Build unter dist/
npm run preview  # startet lokalen Server, um dist/ zu testen
```

## Projektstruktur

```
.
├── public/
│   ├── icons/                   # PWA-Icons (inkl. maskierbare Variante)
│   ├── manifest.webmanifest     # Web App Manifest
│   └── service-worker.js        # Offline-Caching & Fallback-Logik
├── src/
│   ├── App.jsx                  # Hauptkomponente mit Formular, Filter, Persistenz
│   ├── components/
│   │   └── EntryCard.jsx        # Darstellung eines einzelnen Log-Eintrags
│   ├── main.jsx                 # React-Einstieg + Service Worker Registrierung
│   └── styles.css               # UI-Styles
├── icons/                       # Ursprüngliche Icon-Dateien (optional)
├── index.html                   # Vite-Entry-HTML
├── package.json
└── vite.config.js
```

## Funktionsweise

- **Persistenz**: Einträge werden im Browser (`localStorage`) unter dem Key `personal-log-entries` gespeichert. Beim Import wird der vollständige Bestand ersetzt.
- **Filter & Suche**: Dropdown für Zeiträume (`Alle`, `Heute`, `Letzte 7 Tage`) und Freitext-Suche über Titel/Inhalt.
- **Papierkorb**: Gelöschte Einträge wandern für 30 Tage in den Papierkorb und lassen sich jederzeit wiederherstellen oder endgültig entfernen.
- **Export/Import**: JSON-Datei mit ISO-Zeitstempeln; Export erzeugt Dateien im Format `logorama-YYYY-MM-DDTHH-MM-SS.json`. Browser mit File System Access API (Chromium-basiert) erlauben die Verzeichniswahl, andere laden direkt herunter.
- **PWA**: Der Service Worker cached Grund-Assets für Offlinebetrieb; Manifest liefert Shortcuts (`#new-entry`, `#filter=today`) und sorgt für korrekte Darstellung auf Android.

### Papierkorb & Aufbewahrung

- Beim Löschen bleibt der Eintrag als Kopie im Papierkorb. Vorherige Versionen derselben ID werden überschrieben, damit keine Dubletten entstehen.
- Nach 30 Tagen (oder beim nächsten App-Start) werden Papierkorb-Einträge automatisch entfernt.
- „Wiederherstellen“ setzt den Eintrag zurück in den aktiven Bestand; „Endgültig löschen“ entfernt ihn sofort.

## Deployment-Hinweise

- Für statische Hosts (z. B. GitHub Pages, Netlify): Build via `npm run build`, anschließend Inhalt aus `dist/` deployen.
- Stelle sicher, dass die `service-worker.js` mit korrektem Pfad (`/service-worker.js`) ausgeliefert wird. Bei Subverzeichnissen ggf. `base` in `vite.config.js` anpassen.
- HTTPS ist für PWA-Features (insbesondere Service Worker) obligatorisch – Ausnahme: `localhost`.

## Entwicklungstipps

- Anpassungen an Styles direkt in `src/styles.css`. Typische Breakpoints sind bereits vorhanden.
- Bei Änderungen am Service Worker nach Deployments ggf. Browser-Cache löschen bzw. „Update on Reload“ in DevTools aktivieren.
- Datenmodell bewusst einfach gehalten (kein Backend). Für Sync-Lösungen müsste eine API ergänzt werden.
- Die File System Access API funktioniert nur in kompatiblen Browsern (Chromium). In anderen Browsern greift automatisch der klassische Download-Dialog.

## Lizenz

Dieses Projekt ist frei zur privaten Nutzung, Anpassung und Weiterverteilung. Füge nach Bedarf deine bevorzugte Lizenzdatei hinzu (z. B. MIT, Apache 2.0).

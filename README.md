# Logorama

Logorama ist ein persönliches Log als Progressive Web App. Die Anwendung läuft komplett offline, speichert Einträge lokal im Browser und lässt sich auf Android (und anderen Plattformen mit PWA-Unterstützung) wie eine native App installieren. Export und Import funktionieren über JSON-Dateien, um Backups zu erstellen oder Daten zwischen Geräten zu übertragen.

## Highlights

- 🌟 Editorial UI mit Light/Dark-Themes, gesteuert über einen globalen Theme-Switch
- 🧭 React Router + Sticky Bottom Navigation für schnelle Tab-Wechsel (Home · Neu · Einträge · Papierkorb · Backup · Hilfe)
- 📝 Freitext-Log inkl. Datum/Uhrzeit, Suchfunktion sowie Filter für „Heute“ und „Letzte 7 Tage“
- ✏️ Inline-Bearbeitung direkt in der Eintragskarte mit Autospeicherfunktion
- 🗓️ Automatische Wochentags-Titel („1 - Montag“) sobald kein eigener Titel angegeben wird
- 💾 Persistenz über `localStorage` plus verständlicher Sicherungsbereich für JSON-Export/-Import
- 🗑️ Papierkorb mit 30 Tagen Aufbewahrungsfrist, Restore-Option und „Papierkorb leeren“
- 🛡️ Zweistufiger Löschschutz: Knopf färbt sich rot, zweiter Klick löscht endgültig
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
│   ├── App.jsx                  # Orchestriert State, Persistenz, Routing und Panels
│   ├── components/
│   │   ├── ActiveEntriesSection.jsx # Listet aktuelle Einträge
│   │   ├── ConfirmButton.jsx    # Zwei-Klick-Bestätigung für Löschaktionen
│   │   ├── DataSafetyPanel.jsx  # Backup & Restore Panel
│   │   ├── EntryCard.jsx        # Darstellung eines einzelnen Log-Eintrags
│   │   ├── EntryForm.jsx        # Formular zum Erfassen neuer Einträge
│   │   ├── MobileNav.jsx        # Sticky Bottom Navigation (React Router Tabs)
│   │   ├── SearchFilter.jsx     # Suchfeld und Zeitraumfilter
│   │   ├── ThemeToggle.jsx      # Light/Dark Switch für Hero & Mobile Nav
│   │   └── TrashSection.jsx     # Papierkorb Cards & Aktionen
│   ├── main.jsx                 # React-Einstieg + Service Worker Registrierung
│   └── styles.css               # UI-Styles
├── icons/                       # Ursprüngliche Icon-Dateien (optional)
├── index.html                   # Vite-Entry-HTML
├── package.json
└── vite.config.js
```

## Funktionsweise

- **Persistenz**: Einträge werden im Browser (`localStorage`) unter dem Key `personal-log-entries` gespeichert. Beim Import wird der vollständige Bestand ersetzt.
- **Navigation & Layout**: Die App nutzt React Router und stellt sechs Views bereit (`/home`, `/new`, `/entries`, `/trash`, `/backup`, `/help`). Ein sticky Bottom Nav-Bar auf Mobilgeräten verlinkt direkt in die Sektionen; das Desktop-Layout kombiniert Hero-Bereich mit Kennzahlen und Panels.
- **Filter & Suche**: Dropdown für Zeiträume (`Alle`, `Heute`, `Letzte 7 Tage`) und Freitext-Suche über Titel/Inhalt.
- **Papierkorb**: Gelöschte Einträge wandern für 30 Tage in den Papierkorb und lassen sich jederzeit wiederherstellen, einzeln löschen oder komplett entfernen.
- **Inline-Bearbeitung**: Jeder Eintrag bietet einen „Bearbeiten“-Button, der Titel/Inhalt direkt in der Karte editierbar macht. Speichern aktualisiert den Zeitstempel `editedAt`.
- **Automatische Titel**: Ohne eigenen Titel vergibt Logorama fortlaufende Namen pro Kalendertag (`1 - Montag`, `2 - Montag`, …) basierend auf der lokalen Gerätezeit.
- **Theme Switch**: Über Hero-Button oder Mobile-Nav lässt sich zwischen hellem und dunklem Theme umschalten; die Einstellung wird im `localStorage` gespeichert.
- **Export/Import**: Im Bereich „Daten sichern & wiederherstellen“ lassen sich Backups als JSON herunterladen oder wiederherstellen. Export erzeugt Dateien im Format `logorama-YYYY-MM-DDTHH-MM-SS.json`. Browser mit File System Access API (Chromium-basiert) erlauben die Verzeichniswahl, andere laden direkt herunter.
- **PWA**: Der Service Worker cached Grund-Assets für Offlinebetrieb; Manifest liefert Shortcuts (`#new-entry`, `#filter=today`) und sorgt für korrekte Darstellung auf Android.

### Papierkorb & Aufbewahrung

- Beim Löschen bleibt der Eintrag als Kopie im Papierkorb. Vorherige Versionen derselben ID werden überschrieben, damit keine Dubletten entstehen.
- Nach 30 Tagen (oder beim nächsten App-Start) werden Papierkorb-Einträge automatisch entfernt.
- „Wiederherstellen“ setzt den Eintrag zurück in den aktiven Bestand; „Endgültig löschen“ erfordert einen zweiten Klick auf den rot markierten Button.
- „Papierkorb leeren“ entfernt alle Einträge nach einer Sicherheitsabfrage.

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

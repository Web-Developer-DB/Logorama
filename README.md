# Logorama

Logorama ist ein persönliches Log als Progressive Web App. Die Anwendung läuft komplett offline, speichert Einträge lokal im Browser und lässt sich auf Android (und anderen Plattformen mit PWA-Unterstützung) wie eine native App installieren. Export und Import funktionieren über JSON-Dateien, um Backups zu erstellen oder Daten zwischen Geräten zu übertragen.

## Highlights

- 🌟 Editorial UI mit Light/Dark-Themes inkl. System-Auto-Modus
- 🧭 React Router + Sticky Bottom Navigation für schnelle Tab-Wechsel (Home · Einträge · Papierkorb · Backup · Hilfe) sowie direkten CTA für neue Einträge
- 📝 Freitext-Log inkl. Datum/Uhrzeit, Suchfunktion sowie Filter für „Heute“ und „Letzte 7 Tage“
- ✏️ Inline-Bearbeitung direkt in der Eintragskarte mit Autospeicherfunktion
- 🗓️ Automatische Wochentags-Titel („1 - Montag“) sobald kein eigener Titel angegeben wird
- 💾 Persistenz über `localStorage` plus verständlicher Sicherungsbereich für JSON-Export/-Import
- ☁️ Optionale Google-Drive-Synchronisierung für automatische Backups inkl. Statusanzeige
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
- **Navigation & Layout**: Die App nutzt React Router und stellt die Bereiche `/home`, `/entries`, `/trash`, `/backup`, `/help` bereit. Das Formular unter `/new` erreichst du über den Button „Neuantrag erstellen“ auf der Startseite. Die Sticky Bottom Nav-Bar auf Mobilgeräten verlinkt direkt in die Hauptsektionen; das Desktop-Layout kombiniert Hero-Bereich mit Kennzahlen und Panels.
- **Filter & Suche**: Dropdown für Zeiträume (`Alle`, `Heute`, `Letzte 7 Tage`) und Freitext-Suche über Titel/Inhalt.
- **Papierkorb**: Gelöschte Einträge wandern für 30 Tage in den Papierkorb und lassen sich jederzeit wiederherstellen, einzeln löschen oder komplett entfernen.
- **Inline-Bearbeitung**: Jeder Eintrag bietet einen „Bearbeiten“-Button, der Titel/Inhalt direkt in der Karte editierbar macht. Speichern aktualisiert den Zeitstempel `editedAt`.
- **Automatische Titel**: Ohne eigenen Titel vergibt Logorama fortlaufende Namen pro Kalendertag (`1 - Montag`, `2 - Montag`, …) basierend auf der lokalen Gerätezeit.
- **Theme Switch**: Über den Hero-Button lässt sich zwischen System-, Licht- und Dunkelmodus wechseln; die Einstellung wird gespeichert und respektiert das Geräte-Theme.
- **Export/Import**: Im Bereich „Daten sichern & wiederherstellen“ lassen sich Backups als JSON herunterladen oder wiederherstellen. Export erzeugt Dateien im Format `logorama-YYYY-MM-DDTHH-MM-SS.json`. Browser mit File System Access API (Chromium-basiert) erlauben die Verzeichniswahl, andere laden direkt herunter.
- **PWA**: Der Service Worker cached Grund-Assets für Offlinebetrieb; Manifest liefert Shortcuts (`#new-entry`, `#filter=today`) und sorgt für korrekte Darstellung auf Android.

## Architektur-Überblick

- **Hooks**: `useThemeManager`, `useEntriesManager`, `useInstallPrompt` und `useGoogleDriveSync` kapseln Business-Logik, Persistenz und Seiteneffekte. Komponenten konsumieren ausschließlich deren Rückgabewerte.
- **Seitenkomponenten**: Unter `src/components/pages/` liegen reine Präsentationskomponenten (`HomePage`, `EntriesPage`, `NewEntryPage`, `TrashPage`, `BackupPage`, `HelpPage`), die Props des App-Shells rendern.
- **Utils**: In `src/utils/entries.js` befinden sich alle Hilfsfunktionen zur Normalisierung, Generierung und Filterung von Einträgen. Die Navigation bezieht ihre Items aus `src/utils/navItems.jsx`.
- **Kommentierung**: Jedes Modul enthält eine kurze Beschreibung und dokumentiert exportierte Funktionen/Komponenten, damit Einsteiger:innen sich schnell orientieren können.

## Google Drive Synchronisierung einrichten

Logorama kann Sicherungen optional automatisch mit Google Drive abgleichen. Nach dem Aktivieren der Funktion wird im Backup-Bereich der aktuelle Verbindungsstatus sowie die letzte erfolgreiche Synchronisierung angezeigt. Für die Einrichtung sind folgende Schritte erforderlich:

1. **Google Cloud Projekt anlegen** (https://console.cloud.google.com) und die *Google Drive API* aktivieren.
2. **OAuth 2.0 Client** vom Typ „Webanwendung“ erstellen. `http://localhost:5173` muss als autorisierte JavaScript-Quelle und als Weiterleitungs-URI eingetragen sein.
3. **API-Key** für das Projekt erzeugen.
4. Beide Werte in einer lokalen Vite-Umgebung hinterlegen, z. B. in `.env.local`:

   ```env
   VITE_GOOGLE_CLIENT_ID=dein-client-id.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=dein-api-key
   ```

5. Dev-Server neu starten. Anschließend lässt sich die Option „Mit Google Drive synchronisieren“ auf der Backup-Seite aktivieren.

Solange die Synchronisierung aktiv ist, werden Änderungen an Einträgen automatisch in das AppData-Verzeichnis von Google Drive geschrieben. Über die zusätzlichen Buttons kannst du jederzeit manuell synchronisieren oder den letzten Cloud-Stand laden. Bei fehlender Konfiguration oder Auth-Fehlern erscheint eine Statusmeldung mit Fehlertext.

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

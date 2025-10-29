# Logorama

Logorama ist eine Progressive Web App für persönliche Lern- und Projektjournale. Die Anwendung läuft vollständig im Browser, speichert Daten lokal (oder optional in Google Drive) und lässt sich über das PWA-Manifest auf unterstützten Geräten installieren. Dieser Stand der Dokumentation spiegelt die aktuelle, modularisierte Codebasis wider.

## Highlights

- 🌟 Editorial UI mit Light/Dark Themes und System-Auto-Modus
- 🧭 Mehrseitige App via React Router mit Desktop- und Mobile-Navigation
- 📝 Freitext-Einträge mit Inline-Bearbeitung, automatischer Datumsnummerierung und Filteroptionen
- 🗑️ Papierkorb mit 30 Tagen Aufbewahrungsfrist, Restore- und Leeren-Funktion
- 💾 Backup-Panel für JSON-Export/-Import und optionale Google-Drive-Synchronisierung
- ☁️ Drive-Statusanzeige inkl. letzter Sync-Zeit und manueller Sync-/Restore-Buttons
- 📱 PWA-ready (Manifest, Service Worker, maskierbare Icons)
- ⚙️ Saubere Architektur mit klar getrennten Hooks, Utils und Seitenkomponenten

## Bedienungsübersicht

- **Home:** Zeigt Kennzahlen, die drei neuesten Einträge sowie Buttons für „Neuantrag erstellen“, Theme-Wechsel und – falls verfügbar – die PWA-Installation.
- **Einträge verwalten:** Neue Inhalte erfasst du über das Formular „Neuer Eintrag“. In der Liste lassen sich Titel und Text direkt inline bearbeiten, suchen und nach „Heute“ oder „Letzte 7 Tage“ filtern.
- **Papierkorb:** Jeder Löschvorgang ist zweistufig. Einträge können wiederhergestellt oder endgültig entfernt werden; nach 30 Tagen leert Logorama den Papierkorb automatisch, zusätzlich gibt es eine Sammelaktion „Papierkorb leeren“.
- **Backups & Synchronisierung:** JSON-Export/-Import sowie die optionale Google-Drive-Synchronisierung findest du im Bereich „Backup“. Buttons für „Jetzt synchronisieren“ und „Aus Google Drive laden“ ermöglichen manuelle Aktionen.
- **Hilfe-Seite:** Unter `/help` ist eine ausführliche, in der App gepflegte Anleitung eingebettet – sie deckt die oben genannten Workflows mit mehr Kontext ab.

## Installation & Entwicklung

```bash
npm install
npm run dev        # startet Vite-Dev-Server unter http://localhost:5173
npm run build      # erzeugt Produktions-Build in dist/
npm run preview    # startet lokalen Server, um dist/ zu testen
```

## Testing

- **Abhängigkeiten**: Die benötigten Pakete (`jest`, `@testing-library/*`, `@swc/jest`, `identity-obj-proxy`) sind in den Dev-Dependencies verankert – ein `npm install` reicht zur Einrichtung.
- **Kommandos**:
  - `npm run test` führt die gesamte Suite einmal aus.
  - `npm run test:watch` startet Jest im Watch-Modus.
  - `npm run test:ci` läuft sequentiell mit Coverage-Report (Ziel: ≥80 % Statements / Lines).
- **Konventionen**: Tests liegen unter `src/` und enden auf `.test.js|.test.jsx`. Bevorzuge semantische Queries (`getByRole`, `getByLabelText`) und halte Interaktionen mit `userEvent.setup()` realistisch.
- **Stubs & Helfer**: `src/setupTests.js` stellt Service-Worker-, File-Picker- und `gapi`-Stubs bereit. Optional lassen sich dort MSW-Handler oder Accessibility-Prüfungen einklinken – einfach die kommentierten Blöcke aktivieren.
- **Optionale Tools**: Für A11y-Checks `npm i -D jest-axe axe-core`, für API-Mocks `npm i -D msw`, für Fetch-Polyfills `npm i -D whatwg-fetch`. Aktivierung erfolgt über die Kommentar-Hinweise in `src/setupTests.js`.

## Projektstruktur (Stand: aktuelle Architektur)

```
.
├── public/
│   ├── icons/                   # PWA-Icons (inkl. maskierbarer Variante)
│   ├── manifest.webmanifest     # Web App Manifest
│   └── service-worker.js        # Offline-Caching & Fallback-Logik
├── src/
│   ├── App.jsx                  # App-Shell, Routing, Zusammenspiel der Manager-Hooks
│   ├── components/
│   │   ├── ActiveEntriesSection.jsx
│   │   ├── ConfirmButton.jsx
│   │   ├── DataSafetyPanel.jsx
│   │   ├── DesktopNav.jsx
│   │   ├── EntryCard.jsx
│   │   ├── EntryForm.jsx
│   │   ├── MobileNav.jsx
│   │   ├── SearchFilter.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── pages/               # Präsentations-Komponenten für Routen
│   │       ├── BackupPage.jsx
│   │       ├── EntriesPage.jsx
│   │       ├── HelpPage.jsx
│   │       ├── HomePage.jsx
│   │       ├── NewEntryPage.jsx
│   │       └── TrashPage.jsx
│   ├── hooks/
│   │   ├── useEntriesManager.js   # CRUD, Filter, LocalStorage, Ex-/Import
│   │   ├── useGoogleDriveSync.js  # Drive-Verbindung & Statusmanagement
│   │   ├── useInstallPrompt.js    # PWA-Installationsaufforderung
│   │   └── useThemeManager.js     # Theme-Zustand & Systemlistener
│   ├── utils/
│   │   ├── entries.js             # Normalisierung, IDs, Filterlogik
│   │   ├── formatters.js          # Datum-/Zeitformatierung
│   │   └── navItems.jsx           # Zentrale Navigationseinträge
│   ├── main.jsx                 # React-Einstieg + Service-Worker-Registrierung
│   └── styles.css               # Globale UI-Styles, Breakpoints, Variablen
├── dist/                        # Build-Artefakte nach `npm run build`
├── icons/                       # Ursprungsdateien der App-Symbole
├── index.html                   # Vite Entry-HTML
├── package.json
└── vite.config.js
```

## Architektur-Überblick

- **Hooks**: Alle Zustands- und Effektlogiken sind in dedizierte Hooks ausgelagert:
  - `useEntriesManager` verwaltet Einträge, Papierkorb, Suche/Filter, Export/Import.
  - `useThemeManager` steuert Theme-Wechsel, Persistenz und Systemlistener.
  - `useInstallPrompt` kapselt das `beforeinstallprompt`-Event.
  - `useGoogleDriveSync` nutzt Google Identity Services für OAuth, verwaltet Drive-Sync-Status und kapselt Pull/Push-Operationen.
- **Seitenkomponenten**: Unter `components/pages/` liegen reine Präsentationskomponenten für jede Route. Sie erhalten sämtliche Props aus `App.jsx` und bleiben somit logikfrei.
- **Utilities**: Hilfsfunktionen (z. B. Normalisierung, Navigation, Formatierung) sind unter `src/utils/` zentral abgelegt, damit keine doppelten Implementierungen entstehen.
- **Kommentierung**: Jede Komponente und jeder Hook enthält erklärende Kommentare, die Zweck und Funktionsweise für Junior-Entwickler:innen nachvollziehbar machen.

## Funktionsumfang im Detail

- **Persistenz**: Einträge werden standardmäßig unter `personal-log-entries` im `localStorage` gespeichert. Papierkorb-Einträge liegen separat unter `personal-log-trash` und verfallen automatisch nach 30 Tagen.
- **Suche & Filter**: `useEntriesManager` stellt gefilterte und sortierte Listen bereit; die UI-Komponenten reichen lediglich Such- oder Filterwerte zurück.
- **Inline-Editing**: `EntryCard` ermöglicht Bearbeitung direkt in der Karte inkl. Draft-State und Rückfall, falls der Inhalt leer bleibt.
- **Papierkorb**: `TrashPage` zeigt gelöschte Einträge mit Zeitstempeln und bietet Restore/Endgültig-Löschen über den zweistufigen `ConfirmButton`; ein stündlicher Bereinigungslauf löscht Elemente nach 30 Tagen, zusätzlich gibt es „Papierkorb leeren“.
- **Backups**: Das Backup-Panel steuert JSON-Export (mit File System Access API als Fallback) und JSON-Import über das Utility `normalizeEntriesPayload`.
- **Google Drive Sync**: Über einen „Mit Google verbinden“-Button wird OAuth angestoßen. Danach stehen „Aus Google Drive laden“ und „Jetzt synchronisieren“ bereit; Statusmeldungen sowie letzte Sync-Zeit stammen aus `useGoogleDriveSync`.
- **Theme-Steuerung**: `useThemeManager` persistiert die Moduswahl (`system`, `light`, `dark`) und synchronisiert sie mit dem `<html>`-Attribut, sodass CSS-Variablen reagieren.
- **Installation (PWA)**: `useInstallPrompt` merkt sich das Browser-Event, `HomePage` blendet einen Installationsbutton ein, solange die App installierbar ist.

## Google Drive Synchronisierung einrichten

1. In der Google Cloud Console ein Projekt erstellen bzw. auswählen.
2. Unter „APIs & Services“ die Drive API aktivieren.
3. Auf dem OAuth-Zustimmungsbildschirm Testnutzer hinzufügen.
4. Einen OAuth-Client vom Typ „Webanwendung“ anlegen (`http://localhost:5173` als autorisierte JavaScript-Quelle und Redirect URI).
5. Die ausgegebene Client-ID in einer lokalen Env-Datei hinterlegen, z. B. `.env.local`:

   ```env
   VITE_GOOGLE_CLIENT_ID=dein-client-id.apps.googleusercontent.com
   ```

6. Dev-Server neu starten. Im Backup-Bereich kann nun „Mit Google verbinden“ ausgewählt werden.

Die App legt eine Datei `app-data.json` im App-Data-Folder von Google Drive an (nicht im Drive-UI sichtbar). Pull ersetzt lokale Daten vollständig, Push überschreibt den Cloud-Stand (Last-Write-Wins). Fehler wie fehlende Authentifizierung werden direkt im Panel angezeigt.

## Tests & Qualitätssicherung

- `npm run build` dient weiterhin als schneller Integritätscheck, da Vite beim Bundlen Syntaxfehler anzeigt.
- Ergänzend sorgt die Jest/RTL-Suite dafür, dass Formular-, Routing-, Papierkorb- und Backup-Flows stabil bleiben.
- Für manuelle Smoke-Tests empfehlen sich Durchläufe der Kernflows (Eintrag anlegen/bearbeiten/löschen, Papierkorb, Export/Import, Drive-Sync).
- Zusätzliche Lint- oder Integrationstests können bei Bedarf via weitere npm-Skripte ergänzt werden.

## Deployment-Hinweise

- Produktions-Build befindet sich unter `dist/`. Dieser Ordner kann auf statische Hoster (GitHub Pages, Netlify, Vercel etc.) hochgeladen werden.
- HTTPS ist für Service Worker und Google OAuth notwendig (außer auf `localhost`).
- Bei Deployments auf Unterpfade ggf. `base` in `vite.config.js` anpassen, damit Assets korrekt aufgelöst werden.

## Lizenz

Das Projekt wird unter der MIT License bereitgestellt. Anpassungen, Erweiterungen und Redistributierungen sind willkommen – Credits an Logorama bzw. den ursprünglichen Autor bleiben bestehen.

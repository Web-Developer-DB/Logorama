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

## Installation & Entwicklung

```bash
npm install
npm run dev        # startet Vite-Dev-Server unter http://localhost:5173
npm run build      # erzeugt Produktions-Build in dist/
npm run preview    # startet lokalen Server, um dist/ zu testen
```

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
  - `useGoogleDriveSync` übernimmt OAuth, Dateisynchronisation und Statusmeldungen.
- **Seitenkomponenten**: Unter `components/pages/` liegen reine Präsentationskomponenten für jede Route. Sie erhalten sämtliche Props aus `App.jsx` und bleiben somit logikfrei.
- **Utilities**: Hilfsfunktionen (z. B. Normalisierung, Navigation, Formatierung) sind unter `src/utils/` zentral abgelegt, damit keine doppelten Implementierungen entstehen.
- **Kommentierung**: Jede Komponente und jeder Hook enthält erklärende Kommentare, die Zweck und Funktionsweise für Junior-Entwickler:innen nachvollziehbar machen.

## Funktionsumfang im Detail

- **Persistenz**: Einträge werden standardmäßig unter `personal-log-entries` im `localStorage` gespeichert. Papierkorb-Einträge liegen separat unter `personal-log-trash` und verfallen automatisch nach 30 Tagen.
- **Suche & Filter**: `useEntriesManager` stellt gefilterte und sortierte Listen bereit; die UI-Komponenten reichen lediglich Such- oder Filterwerte zurück.
- **Inline-Editing**: `EntryCard` ermöglicht Bearbeitung direkt in der Karte inkl. Draft-State und Rückfall, falls der Inhalt leer bleibt.
- **Papierkorb**: `TrashPage` zeigt gelöschte Einträge mit Zeitstempeln und bietet Restore/Endgültig-Löschen über den zweistufigen `ConfirmButton`.
- **Backups**: Das Backup-Panel steuert JSON-Export (mit File System Access API als Fallback) und JSON-Import über das Utility `normalizeEntriesPayload`.
- **Google Drive Sync**: Aktivierbar per Toggle. Statusmeldungen (“Verbunden”, “Synchronisation läuft…”, Fehlertexte) sowie letzte Sync-Zeit werden angezeigt. Manuelle Sync-/Restore-Buttons triggern `useGoogleDriveSync`.
- **Theme-Steuerung**: `useThemeManager` persistiert die Moduswahl (`system`, `light`, `dark`) und synchronisiert sie mit dem `<html>`-Attribut, sodass CSS-Variablen reagieren.
- **Installation (PWA)**: `useInstallPrompt` merkt sich das Browser-Event, `HomePage` blendet einen Installationsbutton ein, solange die App installierbar ist.

## Google Drive Synchronisierung einrichten

1. Google Cloud Console öffnen und ein Projekt erstellen.
2. Google Drive API aktivieren.
3. OAuth 2.0 Client vom Typ „Webanwendung“ anlegen (`http://localhost:5173` als autorisierte Quelle + Redirect URI eintragen).
4. API-Key erstellen.
5. Lokale `.env.local` (oder passende Vite-Env-Datei) ergänzen:

   ```env
   VITE_GOOGLE_CLIENT_ID=dein-client-id.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=dein-api-key
   ```

6. Dev-Server neu starten. In der App kann nun die Option „Mit Google Drive synchronisieren“ aktiviert werden.

Solange die Synchronisierung aktiv ist, werden Änderungen automatisch in das AppData-Verzeichnis von Google Drive geschrieben. Fehler (z. B. fehlende Authentifizierung) werden im Panel angezeigt.

## Tests & Qualitätssicherung

- `npm run build` dient als schneller Integritätscheck, da Vite beim Bundlen Syntaxfehler anzeigt.
- Für manuelle Tests empfehlen sich Durchläufe der Kernflows (Eintrag anlegen/bearbeiten/löschen, Papierkorb, Export/Import, Drive-Sync).
- Optional lassen sich zusätzliche Lint- oder Testskripte ergänzen (momentan nicht konfiguriert).

## Deployment-Hinweise

- Produktions-Build befindet sich unter `dist/`. Dieser Ordner kann auf statische Hoster (GitHub Pages, Netlify, Vercel etc.) hochgeladen werden.
- HTTPS ist für Service Worker und Google OAuth notwendig (außer auf `localhost`).
- Bei Deployments auf Unterpfade ggf. `base` in `vite.config.js` anpassen, damit Assets korrekt aufgelöst werden.

## Lizenz

Das Projekt wird unter der MIT License bereitgestellt. Anpassungen, Erweiterungen und Redistributierungen sind willkommen – Credits an Logorama bzw. den ursprünglichen Autor bleiben bestehen.

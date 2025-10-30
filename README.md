# Logorama

> Progressive Web App für persönliche Lern- und Projektjournale – komplett offlinefähig, mit JSON-Backups und intuitiver Navigation.

![Build](https://img.shields.io/badge/build-vite_success-brightgreen.svg) ![Tests](https://img.shields.io/badge/tests-jest%20%26%20rtl-4c1.svg) ![Coverage](https://img.shields.io/badge/coverage-%E2%89%A580%25-blue.svg) ![PWA](https://img.shields.io/badge/pwa-ready-1f75fe.svg)

## Schnellstart

1. **Repository clonen** und in den Projektordner wechseln.  
2. `npm install` ausführen – alle Abhängigkeiten (React, React Router, Jest, SWC) werden eingerichtet.  
3. Entwicklung starten: `npm run dev` – Vite bedient die App unter [http://localhost:5173](http://localhost:5173).  
4. Optional: `npm run preview`, um den Produktionsbuild vor dem Deploy zu prüfen.  
5. Die integrierte Hilfe findest du jederzeit unter `/#/help` – ideal für neue Teammitglieder.

## Skripte

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Development-Server (Vite + Hot Module Reloading) |
| `npm run build` | Produktionsbuild nach `dist/` mit Hashes |
| `npm run preview` | Lokaler Preview-Server für `dist/` |
| `npm test` | Jest einmalig ausführen |
| `npm run test:watch` | Jest im Watch-Modus mit Hot Reload |
| `npm run test:ci` | CI-Profil: sequentielle Tests mit Coverage-Report |

> 💡 Linting: ESLint ist konfiguriert (`eslint.config.js`). Für formatierte Commits empfiehlt sich zusätzlich Prettier (`npx prettier --check \"src/**/*.{js,jsx,css}\"`). Eine Prettier-Konfiguration kann bei Bedarf ergänzt werden.

## Architektur-Überblick

```
src/
├─ App.jsx                # Routing, globale Hooks, Desktop/Mobile-Navigation
├─ main.jsx               # React-Einstieg + Service-Worker-Registrierung
├─ components/
│  ├─ [UI-Bausteine].jsx  # Wiederverwendbare Komponenten (EntryCard, ThemeToggle, …)
│  └─ pages/              # Presentational Routes (Home, Entries, Trash, Backup, Help)
├─ hooks/                 # State- & Effekt-Logik (Theme, Entries, InstallPrompt)
├─ utils/                 # Normalisierung, Navigation, Formatierung
├─ styles.css             # Globales Stylesheet inkl. Dark-Mode-Variablen
└─ setupTests.js          # Jest-/RTL-Setup mit Service-Worker- und FS-APIs
```

- **Container vs. Präsentation:** `App.jsx` orchestriert State & Routing. Alle Seiten-/UI-Komponenten sind bewusst dünn gehalten und erhalten ihre Props/Treiber über die Hooks.  
- **Hooks:** `useEntriesManager` kapselt CRUD, LocalStorage, Import/Export sowie Papierkorb; `useThemeManager` behandelt Persistenz & Media-Queries; `useInstallPrompt` speichert das `beforeinstallprompt`-Event.  
- **Tests:** Jede kritische Route hat eine `*.test.jsx`-Datei mit Arrange–Act–Assert-Erklärungen.  
- **Dokumentation im Code:** Alle Dateien besitzen Einsteiger-taugliche Header- und Inline-Kommentare (siehe `HelpPage.jsx`, `useEntriesManager.js`).

## PWA-Features

- **Manifest (`public/manifest.webmanifest`):** Enthält Name, Shortcuts (`Neuer Eintrag`, `Heute`), maskierbare Icons und `display: standalone`.  
- **Service Worker (`public/service-worker.js`):**  
  - Precaching für Shell, Icons und Manifest.  
  - Stale-While-Revalidate für eigene Assets, Cache-First für Fremdquellen.  
  - Offline-Fallback auf `index.html`, damit Hash-Routing funktioniert.  
- **Installations-Flow:** `useInstallPrompt` speichert das Browser-Event, `HomePage` zeigt den Button, solange Installation möglich ist.  
- **Lighthouse-Zielwerte:** Performance ≥ 90, PWA-Check komplett grün, A11y ≥ 90 (siehe Verifikationsbericht).

## Tests

- `npm test` prüft Komponenten und Hooks mit React Testing Library.  
- `npm run test:ci` ermittelt Coverage (Ziel: ≥ 80 % Statements/Lines).  
- Testdateien nutzen semantische Queries (`getByRole`, `getByLabelText`) und `userEvent.setup()` für realistische Interaktionen.  
- `src/setupTests.js` stellt Service-Worker-/FileSystem-Stubs und optionale Hooks für MSW oder jest-axe bereit (einfach kommentierte Abschnitte aktivieren).

## Coding-Standards

- **ESLint:** Flat-Config (`eslint.config.js`) mit React-Empfehlungen; bewusst großzügig für Lernzwecke. Wer striktere Regeln braucht, aktiviert die auskommentierten Regeln sukzessive.  
- **Formatierung:** Einheitliches CSS-Kommentarsystem (Abschnitt/Selektor-Erklärungen). Für JS/JSX empfiehlt sich Prettier (`npx prettier --write`), auch wenn es nicht als DevDependency vorinstalliert ist.  
- **JSDoc:** Komponenten, Hooks und Utilities sind mit JSDoc versehen; Props und Rückgabewerte sind dokumentiert, damit IDEs Autocompletion liefern.

## Barrierefreiheit & i18n

- **A11y:**  
  - Navigationslinks besitzen aussagekräftige Labels, Icons sind `aria-hidden`.  
  - Fokus-Indikatoren werden per CSS-Variablen gesteuert; Keyboard-Nutzung ist vollständig möglich.  
  - `HelpPage` nutzt Sprungmarken (`help-content__toc`) für Screenreader.  
- **Internationalisierung:** App ist aktuell deutschsprachig; Texte sind zentral in Komponenten eingebettet. Für Mehrsprachigkeit empfiehlt sich ein Übersetzungs-Wrapper (z. B. `react-intl`) – Hooks und Komponenten sind klar getrennt, sodass eine spätere Erweiterung einfach bleibt.

## Deployment

1. `npm run build` erzeugt den Produktions-Output in `dist/`.  
2. Den Inhalt von `dist/` auf einen statischen Hoster (Netlify, Vercel, GitHub Pages) hochladen.  
3. Domain über HTTPS ausliefern (Pflicht für PWA-Features).  
4. Falls ein Unterpfad genutzt wird, `base` in `vite.config.js` anpassen.  
5. Service-Worker-Versionierung: `CACHE_NAME` in `public/service-worker.js` bei Breaking Changes erhöhen, damit alte Assets invalidiert werden.

## Changelog-Hinweis

Alle Änderungen sind im [CHANGELOG.md](./CHANGELOG.md) dokumentiert (Schema: *Added · Changed · Fixed · Docs*). Für Version 1.0.0 wurde der Fokus auf Kommentierung, Hilfeseite und Dokumentation gelegt.

## Lizenz

MIT License – siehe [LICENSE](./LICENSE). Beiträge, Forks und Anpassungen sind ausdrücklich willkommen; bitte die ursprünglichen Credits erhalten.

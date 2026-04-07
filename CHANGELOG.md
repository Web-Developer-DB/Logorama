# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei festgehalten.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und SemVer.

## [Unreleased]

### Added
- Komprimierte App-Screenshots (`public/images/help/*.webp`) samt Styles für eine bildgestützte Hilfe.
- Jest-Mock für `react-helmet-async`, damit Seiten- und Routing-Tests ohne Helmet-Provider-Kontext stabil laufen.
- Markdown- und LaTeX-Rendering für Eintragsinhalte via `react-markdown`, `remark-math` und KaTeX, damit aus ChatGPT kopierte wissenschaftliche Formeln lesbar angezeigt werden.
- Normalisierung für typische ChatGPT-Math-Blöcke (`\[...\]`, `\(...\)` sowie zeilenweise `[`/`]`-Blöcke), damit kopierte Formeln ohne manuelle Nacharbeit gerendert werden.

### Changed
- Hilfeseite inhaltlich und visuell überarbeitet: Screenshots eingebunden, Texte an aktuelle UI angepasst.
- HelpPage-Test auf die neuen TOC-Bezeichnungen aktualisiert.
- App-Shell vollständig modernisiert: Desktop-Sidebar, kompakte Topbar, klarere Status-Chips und ruhigeres responsives Layout bei unveränderter Kernlogik.
- Home-, Einträge-, Neuer-Eintrag-, Papierkorb-, Backup- und Hilfe-Screens visuell und strukturell überarbeitet, mit mehr Fokus auf Arbeitsfläche, reduzierter Navigationslast und konsistenteren Karten-/Panel-Patterns.
- Formular-, Filter-, Karten- und Backup-UI konsolidiert: klarere visuelle Hierarchie, kontextbezogene Meta-Informationen, vereinheitlichte Buttons und modernisierte Spacing-/Typografie-Standards.
- Globales Styling vollständig neu aufgebaut, inklusive neuer Design-Tokens für Light/Dark Mode, verbesserter Mobile-Navigation und ruhigerer SaaS-orientierter Oberflächenwirkung.
- `Seo`-Komponente für Build- und Testumgebungen robuster gemacht, indem die Site-URL ohne direkten `import.meta`-Zugriff aufgelöst wird.
- Eintrags- und Papierkorbansichten von Plaintext auf strukturiertes Rich-Text-Rendering umgestellt, inklusive Styles für Überschriften, Zitate, Code, Tabellen und Formelboxen.

### Fixed
- Veraltete `baseline-browser-mapping`-Daten im Dev-Tooling aktualisiert, damit die entsprechende Browserslist-/Vite-Warnung nicht mehr erscheint.

## [1.0.0] - 2025-10-30

### Added
- Ausführliche Datei-Header und JSDoc-Kommentare für Komponenten, Hooks und Tests zur besseren Orientierung neuer Entwickler:innen.
- Überarbeitete In-App-Hilfe mit Inhaltsverzeichnis, Mini-Tutorials, Troubleshooting-Abschnitt sowie Platzhaltern für Screenshots.
- Zusätzliche Styles für den Hilfebereich (TOC, Bildplatzhalter, Footer-Hinweise).

### Changed
- README komplett neu strukturiert (Schnellstart, Skripte, Architektur, PWA-Features, Tests, A11y, Deployment).
- ESLint-Konfiguration formatiert und dokumentiert; Hinweise auf Prettier-Nutzung ergänzt.

### Docs
- CHANGELOG eingeführt und Release-Hinweise für Version 1.0.0 aufgenommen.
- Testdateien mit Arrange–Act–Assert-Kommentaren versehen, damit neue Beiträge leichter folgen können.

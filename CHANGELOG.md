# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei festgehalten.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und SemVer.

## [1.0.2] - 2025-10-31

### Added
- Komprimierte App-Screenshots (`public/images/help/*.webp`) samt Styles für eine bildgestützte Hilfe.

### Changed
- Hilfeseite inhaltlich und visuell überarbeitet: Screenshots eingebunden, Texte an aktuelle UI angepasst.
- HelpPage-Test auf die neuen TOC-Bezeichnungen aktualisiert.

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

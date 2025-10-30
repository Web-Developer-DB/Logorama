/**
 * @file HomePage.jsx
 * @description Landing-Route mit Kennzahlen, Hero-Text und Schnellzugriffen.
 */

import { Link } from "react-router-dom";
import ActiveEntriesSection from "../ActiveEntriesSection.jsx";
import ThemeToggle from "../ThemeToggle.jsx";

/**
 * Startseite mit Kennzahlen, Hero-Text und den drei neuesten Einträgen.
 * Die Komponente ist bewusst presentational und erhält alle Aktionen/Stände
 * über Props, damit sie sich leicht testen lässt.
 *
 * @param {Object} props React-Props.
 * @param {{ totalEntries: number, todayCount: number, weekCount: number, trashEntryCount: number }} props.stats
 *        Aggregierte Kennzahlen.
 * @param {Array} props.latestEntries Neueste Einträge (bereits reduziert auf drei Elemente).
 * @param {(id: string) => void} props.onDeleteEntry Übergibt Löschwünsche an die App.
 * @param {(id: string, updates: { title?: string, content?: string }) => void} props.onUpdateEntry
 *        Persistiert Inline-Änderungen.
 * @param {"system"|"light"|"dark"} props.themeMode Gewählter Modus-Schalter.
 * @param {"light"|"dark"} props.resolvedTheme Tatsächlich aktives Theme.
 * @param {() => void} props.onToggleTheme Durchläuft die Theme-Modi.
 * @param {() => void} props.onInstallApp Löst die PWA-Installation aus.
 * @param {boolean} props.canInstall Steuert, ob der Installationsbutton sichtbar ist.
 * @returns {JSX.Element} Kompletter Home-Screen.
 */
const HomePage = ({
  stats,
  latestEntries,
  onDeleteEntry,
  onUpdateEntry,
  themeMode,
  resolvedTheme,
  onToggleTheme,
  onInstallApp,
  canInstall
}) => (
  <>
    <header className="app-hero">
      <div className="app-hero__content">
        <p className="app-hero__eyebrow">Persönliches Lernjournal</p>
        <h1>Logorama</h1>
        <p className="app-hero__lead">
          Arbeite strukturiert an deinen Projekten: Logorama speichert Gedanken, Fortschritte und
          Ideen offline im Browser und bietet schnelle Filter für deinen Alltag.
        </p>
        <div className="app-hero__actions">
          <Link to="/new" className="primary">
            Neuantrag erstellen
          </Link>
          <ThemeToggle mode={themeMode} resolvedTheme={resolvedTheme} onToggle={onToggleTheme} />
          {canInstall ? (
            <button type="button" className="ghost" onClick={onInstallApp}>
              App installieren
            </button>
          ) : null}
        </div>
      </div>
      <ul className="app-hero__metrics">
        <li>
          <span className="metric-value">{stats.totalEntries}</span>
          <span className="metric-label">Gesamte Einträge</span>
        </li>
        <li>
          <span className="metric-value">{stats.todayCount}</span>
          <span className="metric-label">Heute verfasst</span>
        </li>
        <li>
          <span className="metric-value">{stats.weekCount}</span>
          <span className="metric-label">Diese Woche</span>
        </li>
        <li>
          <span className="metric-value">{stats.trashEntryCount}</span>
          <span className="metric-label">Im Papierkorb</span>
        </li>
      </ul>
    </header>
    <section className="panel">
      <header className="panel-heading">
        <h2 className="panel-title">Aktuelle Einträge</h2>
        <p className="panel-subtitle">
          Die drei neuesten Anträge auf einen Blick. Für weitere Details wähle den Menüpunkt
          „Einträge“.
        </p>
      </header>
      <ActiveEntriesSection entries={latestEntries} onDelete={onDeleteEntry} onUpdate={onUpdateEntry} />
    </section>
  </>
);

export default HomePage;

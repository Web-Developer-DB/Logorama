/**
 * @file HomePage.jsx
 * @description Landing-Route mit Kennzahlen, Hero-Text und Schnellzugriffen.
 */

import { Link } from "react-router-dom";
import ActiveEntriesSection from "../components/ActiveEntriesSection.jsx";
import Seo from "../components/Seo.jsx";

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
 * @returns {JSX.Element} Kompletter Home-Screen.
 */
const HomePage = ({
  stats,
  latestEntries,
  onDeleteEntry,
  onUpdateEntry
}) => (
  <>
    <Seo
      title="Logorama – Offline Lernjournal & Notiz-PWA"
      description="Plane Projekte, halte Fortschritte fest und arbeite offline weiter – Logorama speichert deine Einträge lokal, bietet Filter und lässt sich als PWA installieren."
      path="/home"
      keywords="Logorama, Lernjournal, Offline Notizen, Productivity App, PWA, Hash Router, JSON Export"
      structuredData={({ canonicalUrl }) => ({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Logorama",
        url: canonicalUrl,
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        inLanguage: "de-DE",
        description:
          "Logorama ist eine kostenlose Web-App, die persönliche Logs offline speichert, filtert und als PWA installierbar ist.",
        creator: {
          "@type": "Person",
          name: "Dimitri B"
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR"
        },
        featureList: [
          "Offline nutzbar ohne Konto",
          "JSON Export & Import",
          "Filter für Zeiträume und Suche",
          "Installierbar als Progressive Web App"
        ]
      })}
    />
    <section className="home-grid">
      <header className="app-hero">
        <div className="app-hero__content">
          <p className="app-hero__eyebrow">Persönliches Lernjournal</p>
          <h1>Logorama</h1>
          <p className="app-hero__lead">
            Halte Gedanken, Fortschritte und offene Themen in einer ruhigen Oberfläche fest. Der
            Fokus liegt auf deinem Inhalt, nicht auf unnötigem UI-Rauschen.
          </p>
          <div className="app-hero__actions">
            <Link to="/new" className="primary">
              Neuen Eintrag erstellen
            </Link>
            <Link to="/entries" className="secondary">
              Einträge öffnen
            </Link>
          </div>
          <p className="app-hero__note">
            Alle Daten bleiben lokal im Browser gespeichert und sind auch offline verfügbar.
          </p>
        </div>
        <div className="app-hero__aside">
          <p className="app-hero__section-label">Arbeitsstatus</p>
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
        </div>
      </header>
      <section className="panel panel--spotlight">
        <header className="panel-heading panel-heading--split">
          <div>
            <p className="panel-eyebrow">Aktueller Fokus</p>
            <h2 className="panel-title">Neueste Einträge</h2>
            <p className="panel-subtitle">
              Die drei jüngsten Einträge bleiben direkt greifbar, damit du ohne Umwege
              weiterarbeiten kannst.
            </p>
          </div>
          <Link to="/entries" className="ghost">
            Alle Einträge
          </Link>
        </header>
        <ActiveEntriesSection
          entries={latestEntries}
          onDelete={onDeleteEntry}
          onUpdate={onUpdateEntry}
        />
      </section>
    </section>
  </>
);

export default HomePage;

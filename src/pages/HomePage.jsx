/**
 * @file HomePage.jsx
 * @description Landing-Route mit Kennzahlen, Hero-Text und Schnellzugriffen.
 */

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
}) => {
  const heroMetrics = [
    {
      label: "Einträge diese Woche",
      value: stats.weekCount
    },
    {
      label: "Heute erfasst",
      value: stats.todayCount
    },
    {
      label: "Aktive Sammlung",
      value: stats.totalEntries
    }
  ];

  return (
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
      <header className="dashboard-hero panel panel--hero">
        <div className="dashboard-hero__main">
          <div className="dashboard-hero__chips">
            <span className="app-topbar__pill">Offline-fähig</span>
            <span className="app-topbar__pill">Lokal gespeichert</span>
            <span className="app-topbar__pill">PWA bereit</span>
          </div>
          <div className="dashboard-hero__heading">
            <h1>Logorama</h1>
            <p className="app-hero__lead">
              Du bleibst im Flow. Jeder neue Eintrag hält Gedanken, Fortschritte und offene Punkte
              in einer konzentrierten Arbeitsfläche fest.
            </p>
          </div>
          <article className="dashboard-hero__metrics-card" aria-label="Schnellüberblick">
            {heroMetrics.map((item) => (
              <div key={item.label} className="dashboard-hero__metric">
                <span className="dashboard-hero__metric-label">{item.label}</span>
                <strong className="dashboard-hero__metric-value">{item.value}</strong>
              </div>
            ))}
          </article>
        </div>
      </header>

      <section className="dashboard-workspace">
        <section className="panel panel--spotlight dashboard-workspace__main">
          <header className="panel-heading">
            <div>
              <p className="panel-eyebrow">Arbeitsfläche</p>
              <h2 className="panel-title">Neueste Einträge</h2>
              <p className="panel-subtitle">
                Die letzten Einträge bleiben direkt sichtbar, damit du Inhalte weiterentwickeln
                kannst, ohne in andere Bereiche springen zu müssen.
              </p>
            </div>
          </header>
          <ActiveEntriesSection
            entries={latestEntries}
            onDelete={onDeleteEntry}
            onUpdate={onUpdateEntry}
          />
        </section>
      </section>
    </section>
  </>
  );
};

export default HomePage;

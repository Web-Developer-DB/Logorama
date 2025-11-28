/**
 * @file EntriesPage.jsx
 * @description Route für die vollständige Eintragsliste mit Suche und Filter.
 */

import SearchFilter from "../components/SearchFilter.jsx";
import ActiveEntriesSection from "../components/ActiveEntriesSection.jsx";
import Seo from "../components/Seo.jsx";

/**
 * Zeigt die komplette Liste aller Einträge inklusive Suchleiste
 * und Zeitraumfilter. Die Filtering-Logik liegt in den Elternkomponenten,
 * diese Präsentations-Komponente kümmert sich nur um Markup.
 *
 * @param {Object} props React-Props.
 * @param {Array} props.entries Vorverfilterte Einträge aus den Hooks.
 * @param {string} props.searchValue Aktueller Suchtext.
 * @param {(value: string) => void} props.onSearchChange Aktualisiert den Suchtext.
 * @param {"all"|"today"|"week"} props.filterValue Gewählter Zeitraumfilter.
 * @param {(value: "all"|"today"|"week") => void} props.onFilterChange Handler für das Dropdown.
 * @param {(id: string) => void} props.onDeleteEntry Verschiebt Einträge in den Papierkorb.
 * @param {(id: string, updates: { title?: string, content?: string }) => void} props.onUpdateEntry
 *        Persistiert Inline-Bearbeitungen.
 * @returns {JSX.Element} Panel mit Filterleiste und Eintragsliste.
 */
const EntriesPage = ({
  entries,
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  onDeleteEntry,
  onUpdateEntry
}) => (
  <>
    <Seo
      title="Einträge durchsuchen – Logorama"
      description="Durchsuche dein Logbuch nach Stichwort oder Zeitraum, um erledigte Schritte und Ideen blitzschnell zu finden."
      path="/entries"
      keywords="Logbuch durchsuchen, Filter Ansicht, Notizen finden, Einträge Liste"
    />
    <section className="panel">
      <header className="panel-heading">
        <h2 className="panel-title">Alle Einträge</h2>
        <p className="panel-subtitle">
          Filtere nach Zeitraum und Stichwort, um deine Notizen schneller zu finden.
        </p>
      </header>
      <SearchFilter
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        filterValue={filterValue}
        onFilterChange={onFilterChange}
      />
      <ActiveEntriesSection entries={entries} onDelete={onDeleteEntry} onUpdate={onUpdateEntry} />
    </section>
  </>
);

export default EntriesPage;

import SearchFilter from "../SearchFilter.jsx";
import ActiveEntriesSection from "../ActiveEntriesSection.jsx";

/**
 * Zeigt die komplette Liste aller Einträge inklusive Suchleiste
 * und Zeitraumfilter. DieFiltering-Logik liegt in den Elternkomponenten,
 * diese Präsentations-Komponente kümmert sich nur um Markup.
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
);

export default EntriesPage;

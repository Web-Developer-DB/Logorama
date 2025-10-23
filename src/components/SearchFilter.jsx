import { memo } from "react";

/**
 * Steuerleiste für Sucheingabe und Datumsfilter.
 *
 * Verantwortlichkeiten:
 * - Präsentiert ein Suchfeld, das Titel und Inhalt filtert.
 * - Stellt ein Dropdown für voreingestellte Zeitbereiche bereit.
 * - Delegiert Änderungen über Callback-Props zurück an den Parent.
 */
const SearchFilter = ({ searchValue, onSearchChange, filterValue, onFilterChange }) => (
  <div className="log-form" style={{ marginBottom: "16px" }}>
    <input
      type="search"
      placeholder="Suche nach Stichworten"
      value={searchValue}
      onChange={(event) => onSearchChange(event.target.value)}
    />
    <select value={filterValue} onChange={(event) => onFilterChange(event.target.value)}>
      <option value="all">Alle Einträge</option>
      <option value="today">Heute</option>
      <option value="week">Letzte 7 Tage</option>
    </select>
  </div>
);

export default memo(SearchFilter);

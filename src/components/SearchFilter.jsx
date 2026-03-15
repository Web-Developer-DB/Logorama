/**
 * @file SearchFilter.jsx
 * @description Bedienleiste mit Volltextsuche und Zeitfilter-Auswahl für die
 * Eintragsübersicht.
 */

import { memo } from "react";

/**
 * Steuerleiste für Sucheingabe und Datumsfilter.
 *
 * Verantwortlichkeiten:
 * - Präsentiert ein Suchfeld, das Titel und Inhalt filtert.
 * - Stellt ein Dropdown für voreingestellte Zeitbereiche bereit.
 * - Delegiert Änderungen über Callback-Props zurück an den Parent.
 *
 * @param {Object} props React-Props.
 * @param {string} props.searchValue Aktueller Suchtext.
 * @param {(value: string) => void} props.onSearchChange Callback bei Änderungen des Suchtexts.
 * @param {"all"|"today"|"week"} props.filterValue Gewählter Zeitraumfilter.
 * @param {(value: "all" | "today" | "week") => void} props.onFilterChange Änderungen des Filters.
 * @param {number} [props.resultCount] Optionaler Ergebniszähler für Statushinweise.
 */
const SearchFilter = ({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  resultCount
}) => (
  <div className="filter-toolbar">
    <label className="filter-toolbar__field filter-toolbar__field--search">
      <span className="filter-toolbar__label">Suche</span>
      <input
        type="search"
        placeholder="Suche nach Stichworten"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </label>
    <label className="filter-toolbar__field filter-toolbar__field--select">
      <span className="filter-toolbar__label">Zeitraum</span>
      <select
        className="filter-toolbar__select"
        value={filterValue}
        onChange={(event) => onFilterChange(event.target.value)}
      >
        <option value="all">Alle Einträge</option>
        <option value="today">Heute</option>
        <option value="week">Letzte 7 Tage</option>
      </select>
    </label>
    {typeof resultCount === "number" ? (
      <p className="filter-toolbar__meta" aria-live="polite">
        {resultCount} {resultCount === 1 ? "Eintrag" : "Einträge"}
      </p>
    ) : null}
  </div>
);

export default memo(SearchFilter);

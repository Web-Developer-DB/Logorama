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
 */
const SearchFilter = ({ searchValue, onSearchChange, filterValue, onFilterChange }) => (
  <div className="filter-toolbar">
    <input
      type="search"
      placeholder="Suche nach Stichworten"
      value={searchValue}
      onChange={(event) => onSearchChange(event.target.value)}
    />
    <select
      className="filter-toolbar__select"
      value={filterValue}
      onChange={(event) => onFilterChange(event.target.value)}
    >
      <option value="all">Alle Einträge</option>
      <option value="today">Heute</option>
      <option value="week">Letzte 7 Tage</option>
    </select>
  </div>
);

export default memo(SearchFilter);

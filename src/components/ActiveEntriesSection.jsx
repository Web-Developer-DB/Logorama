/**
 * @file ActiveEntriesSection.jsx
 * @description Präsentationsliste für aktive Einträge. Sortiert Items, zeigt
 * leerzustand und delegiert Edit- sowie Delete-Aktionen an die EntryCard.
 */

import { memo } from "react";
import EntryCard from "./EntryCard.jsx";

/**
 * @typedef {Object} LogEntry
 * @property {string} id Eindeutige Kennung (UUID oder Fallback).
 * @property {string} title Optionaler Titel des Eintrags.
 * @property {string} content Pflichtfeld: Freitextinhalt.
 * @property {string} createdAt ISO-String des Erstellungszeitpunkts.
 * @property {string} editedAt ISO-String der letzten Änderung.
 * @property {boolean} [isAutoTitle] Kennzeichnet automatisch generierte Titel.
 */

/**
 * Rendert eine Liste aktiver Einträge in absteigender Reihenfolge.
 * Die eigentliche Kartenkomponente übernimmt die Inline-Bearbeitung;
 * hier kümmern wir uns nur um Sortierung und Leerzustand.
 *
 * @param {Object} props React-Props.
 * @param {LogEntry[]} props.entries Alle Einträge, unsortiert.
 * @param {(id: string) => void} props.onDelete Handler zum Verschieben in den Papierkorb.
 * @param {(id: string, updates: Partial<Pick<LogEntry, "title" | "content">>) => void} props.onUpdate
 *        Callback, der aktualisierte Inhalte zurück in die App schreibt.
 * @returns {JSX.Element} Section mit Karten oder Leerhinweis.
 */
const ActiveEntriesSection = ({ entries, onDelete, onUpdate }) => {
  if (!entries.length) {
    return (
      <div className="panel-empty">
        <p>Noch keine Einträge. Lege mit deinem ersten Log los!</p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="log-list">
      {sortedEntries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default memo(ActiveEntriesSection);

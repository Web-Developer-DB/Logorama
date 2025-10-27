import { memo } from "react";
import EntryCard from "./EntryCard.jsx";

/**
 * Listet alle aktiven Einträge ohne Akkordeon.
 */
const ActiveEntriesSection = ({ entries, onDelete, onUpdate }) => {
  if (!entries.length) {
    return (
      <div className="panel-empty">
        <p>Noch keine Einträge. Lege mit deinem ersten Log los!</p>
      </div>
    );
  }

  return (
    <div className="log-list">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default memo(ActiveEntriesSection);

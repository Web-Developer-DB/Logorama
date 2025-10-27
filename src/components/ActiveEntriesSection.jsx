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

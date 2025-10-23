import { memo, useMemo, useState } from "react";
import EntryCard from "./EntryCard.jsx";

/**
 * Listet aktive Einträge inklusive Akkordeon für ältere Logs.
 *
 * Verantwortlichkeiten:
 * - Zeigt den neuesten Eintrag stets vollständig an.
 * - Kapselt die Akkordeon-Logik für ältere Einträge (5er-Gruppen, „Weiter“-Button).
 * - Delegiert Löschaktionen an die übergebenen Handler.
 */
const ActiveEntriesSection = ({ entries, onDelete, onUpdate }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const { latestEntry, olderEntries, visibleOlderEntries, hasMoreOlderEntries } = useMemo(() => {
    const newest = entries[0] ?? null;
    const rest = entries.slice(1);
    const visible = rest.slice(0, visibleCount);
    return {
      latestEntry: newest,
      olderEntries: rest,
      visibleOlderEntries: visible,
      hasMoreOlderEntries: rest.length > visible.length
    };
  }, [entries, visibleCount]);

  const toggleAccordion = () => {
    setIsAccordionOpen((prev) => {
      const next = !prev;
      if (!prev) {
        setVisibleCount(5);
      }
      return next;
    });
  };

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, olderEntries.length));
  };

  if (!entries.length) {
    return (
      <div className="empty-state">
        <p>Noch keine Einträge. Lege mit deinem ersten Log los!</p>
      </div>
    );
  }

  return (
    <div className="log-list">
      {latestEntry ? (
        <EntryCard entry={latestEntry} onDelete={onDelete} onUpdate={onUpdate} />
      ) : null}

      {olderEntries.length ? (
        <div className={`accordion ${isAccordionOpen ? "open" : ""}`}>
          <button type="button" className="accordion-toggle" onClick={toggleAccordion}>
            <span>
              Ältere Einträge {olderEntries.length ? `(${olderEntries.length})` : ""}
            </span>
            <span className="accordion-icon">{isAccordionOpen ? "^" : "v"}</span>
          </button>

          {isAccordionOpen ? (
            <div className="accordion-panel">
              {visibleOlderEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}

              {hasMoreOlderEntries ? (
                <button type="button" className="secondary accordion-more" onClick={loadMore}>
                  Weiter
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default memo(ActiveEntriesSection);

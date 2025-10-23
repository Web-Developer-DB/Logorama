import { memo, useCallback, useMemo, useState } from "react";
import ConfirmButton from "./ConfirmButton.jsx";

/**
 * Darstellung des Papierkorbs inklusive Akkordeon-Mechanik.
 *
 * Verantwortlichkeiten:
 * - Präsentiert gelöschte Einträge in 5er-Blöcken mit optionalem „Weiter“-Button.
 * - Ermöglicht Wiederherstellen einzelner Einträge oder endgültiges Löschen via Zweiklick.
 * - Bietet Abschlussaktionen wie „Alle Anträge löschen“, die vom Parent verwaltet werden.
 */
const TrashSection = ({
  entries,
  onRestore,
  onDeleteForever,
  onEmptyTrash,
  formatDateTime
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedEntryIds, setExpandedEntryIds] = useState(() => new Set());

  const { visibleEntries, hasMoreEntries } = useMemo(() => {
    const visible = entries.slice(0, visibleCount);
    return {
      visibleEntries: visible,
      hasMoreEntries: entries.length > visible.length
    };
  }, [entries, visibleCount]);

  const toggleAccordion = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!prev) {
        setVisibleCount(5);
      }
      return next;
    });
  };

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, entries.length));
  };

  const toggleEntry = useCallback((id) => {
    setExpandedEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <section className="card trash-card">
      <div className={`accordion trash-accordion ${isOpen ? "open" : ""}`}>
        <button type="button" className="accordion-toggle" onClick={toggleAccordion}>
          <span>
            {isOpen ? "Papierkorb schließen" : `Papierkorb anzeigen (${entries.length})`}
          </span>
          <span className="accordion-icon">{isOpen ? "^" : "v"}</span>
        </button>

        {isOpen ? (
          <div className="accordion-panel">
            {visibleEntries.length ? (
              <>
                <div className="trash-list">
                  {visibleEntries.map((entry) => {
                    const isExpanded = expandedEntryIds.has(entry.id);
                    return (
                      <article
                        key={entry.id}
                        className={`trash-entry ${isExpanded ? "expanded" : ""}`}
                      >
                        <button
                          type="button"
                          className="trash-entry-toggle"
                          onClick={() => toggleEntry(entry.id)}
                          aria-expanded={isExpanded}
                        >
                          <div className="trash-title-group">
                            <strong>{entry.title || "Ohne Titel"}</strong>
                            <span className="trash-meta">
                              Gelöscht am {formatDateTime(entry.deletedAt)}
                            </span>
                          </div>
                          <div className="trash-entry-meta">
                            <time dateTime={entry.createdAt}>
                              Erstellt am {formatDateTime(entry.createdAt)}
                            </time>
                            <span className="accordion-icon">{isExpanded ? "^" : "v"}</span>
                          </div>
                        </button>
                        {isExpanded ? (
                          <div className="trash-entry-body">
                            <p>{entry.content}</p>
                            <div className="trash-entry-actions">
                              <button
                                type="button"
                                className="secondary"
                                onClick={() => onRestore(entry.id)}
                              >
                                Wiederherstellen
                              </button>
                              <ConfirmButton
                                initialLabel="Löschen"
                                confirmLabel="Endgültig löschen"
                                className="secondary"
                                confirmClassName="danger"
                                resetDelay={1200}
                                onConfirm={() => onDeleteForever(entry.id)}
                              />
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>

                {hasMoreEntries ? (
                  <button type="button" className="secondary accordion-more" onClick={loadMore}>
                    Weiter
                  </button>
                ) : null}

                <button
                  type="button"
                  className="danger accordion-delete-all"
                  onClick={onEmptyTrash}
                >
                  Alle Anträge löschen
                </button>
              </>
            ) : (
              <div className="trash-empty">
                <p>Papierkorb ist leer. Gelöschte Einträge bleiben 30 Tage erhalten.</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default memo(TrashSection);

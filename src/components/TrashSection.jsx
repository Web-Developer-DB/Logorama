import { useMemo, useState } from "react";
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
  description,
  formatDateTime
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

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

  return (
    <section className="card trash-card">
      <div className="trash-header">
        <h2>Papierkorb</h2>
        <p>{description}</p>
      </div>

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
                  {visibleEntries.map((entry) => (
                    <article key={entry.id} className="log-entry trash-entry">
                      <header>
                        <div className="trash-title-group">
                          <strong>{entry.title || "Ohne Titel"}</strong>
                          <span className="trash-meta">
                            Gelöscht am {formatDateTime(entry.deletedAt)}
                          </span>
                        </div>
                        <time dateTime={entry.createdAt}>
                          Erstellt am {formatDateTime(entry.createdAt)}
                        </time>
                      </header>
                      <p>{entry.content}</p>
                      <footer>
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
                      </footer>
                    </article>
                  ))}
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

export default TrashSection;

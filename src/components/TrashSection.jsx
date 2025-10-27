import { memo } from "react";
import ConfirmButton from "./ConfirmButton.jsx";

/**
 * Zeigt den Papierkorb ohne Akkordeon – alle Einträge werden direkt dargestellt.
 */
const TrashSection = ({ entries, onRestore, onDeleteForever, onEmptyTrash, formatDateTime }) => {
  const hasEntries = entries.length > 0;

  return (
    <section className="panel trash-panel">
      <header className="panel-heading">
        <h2 className="panel-title">Papierkorb</h2>
        <p className="panel-subtitle">
          {hasEntries
            ? `${entries.length} ${entries.length === 1 ? "Eintrag" : "Einträge"}`
            : "Keine Einträge im Papierkorb"}
        </p>
      </header>

      {hasEntries ? (
        <>
          <div className="trash-list">
            {entries.map((entry) => (
              <article key={entry.id} className="trash-entry">
                <div className="trash-entry-head">
                  <div className="trash-title-group">
                    <strong>{entry.title || "Ohne Titel"}</strong>
                    <span className="trash-meta">
                      Gelöscht am {formatDateTime(entry.deletedAt)}
                    </span>
                  </div>
                  <time className="trash-meta" dateTime={entry.createdAt}>
                    Erstellt am {formatDateTime(entry.createdAt)}
                  </time>
                </div>
                <p className="trash-entry-content">{entry.content}</p>
                <div className="trash-entry-actions">
                  <button type="button" className="secondary" onClick={() => onRestore(entry.id)}>
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
              </article>
            ))}
          </div>
          <button type="button" className="danger trash-clear" onClick={onEmptyTrash}>
            Papierkorb leeren
          </button>
        </>
      ) : (
        <div className="panel-empty">
          <p>Papierkorb ist leer. Gelöschte Einträge bleiben 30 Tage erhalten.</p>
        </div>
      )}
    </section>
  );
};

export default memo(TrashSection);

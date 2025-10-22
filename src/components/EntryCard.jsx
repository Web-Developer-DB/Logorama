// Ermittelt das Initial für den Avatar-Kringel – bevorzugt Titel, sonst Content.
const getInitial = (entry) => {
  const source = (entry.title || entry.content || "L").trim();
  return source.charAt(0).toUpperCase();
};

// Einheitliche Datumsausgabe für Eintrag und Header.
const formatDate = (isoString) =>
  new Date(isoString).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  });

/**
 * Präsentationskomponente für einen einzelnen Logeintrag.
 * Der Lösch-Button delegiert die eigentliche Aktion an den Parent.
 */
const EntryCard = ({ entry, onDelete }) => (
  <article className="log-entry">
    <header>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "0.9rem",
            background: "rgba(99, 102, 241, 0.15)",
            color: "#c7d2fe",
            flexShrink: 0
          }}
        >
          {getInitial(entry)}
        </span>
        <strong>{entry.title || "Ohne Titel"}</strong>
      </div>
      <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
    </header>
    <p>{entry.content}</p>
    <footer>
      <button type="button" className="secondary" onClick={() => onDelete(entry.id)}>
        Löschen
      </button>
    </footer>
  </article>
);

export default EntryCard;

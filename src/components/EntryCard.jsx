import { useEffect, useState } from "react";
import ConfirmButton from "./ConfirmButton.jsx";

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
 * Der Löschen-Button nutzt eine zweistufige Bestätigung und delegiert die finale Aktion nach außen.
 */
const EntryCard = ({ entry, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(entry.title ?? "");
  const [draftContent, setDraftContent] = useState(entry.content ?? "");

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(entry.title ?? "");
      setDraftContent(entry.content ?? "");
    }
  }, [entry.title, entry.content, isEditing]);

  const handleToggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const nextTitle = draftTitle.trim();
    const nextContent = draftContent.trim();

    if (!nextContent) {
      return;
    }

    // Kein Persist nötig, wenn sich nichts geändert hat.
    if (nextTitle === (entry.title ?? "") && nextContent === (entry.content ?? "")) {
      setIsEditing(false);
      return;
    }

    onUpdate?.(entry.id, {
      title: nextTitle,
      content: nextContent
    });
    setIsEditing(false);
  };

  return (
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
          {isEditing ? (
            <input
              type="text"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Ohne Titel"
              maxLength={120}
              style={{
                flex: 1,
                background: "rgba(15, 23, 42, 0.35)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "12px",
                padding: "8px 10px",
                color: "inherit",
                fontWeight: 600
              }}
            />
          ) : (
            <strong>{entry.title || "Ohne Titel"}</strong>
          )}
        </div>
        <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
      </header>
      {isEditing ? (
        <textarea
          value={draftContent}
          onChange={(event) => setDraftContent(event.target.value)}
          placeholder="Eintrag bearbeiten"
          style={{
            width: "100%",
            minHeight: "120px",
            marginTop: "12px",
            borderRadius: "14px",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            background: "rgba(15, 23, 42, 0.35)",
            color: "inherit",
            padding: "12px 16px",
            fontSize: "0.95rem",
            resize: "vertical"
          }}
        />
      ) : (
        <p>{entry.content}</p>
      )}
      <footer
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "nowrap",
          alignItems: "center"
        }}
      >
        <button
          type="button"
          className={isEditing ? "primary" : "secondary"}
          onClick={handleToggleEdit}
          disabled={isEditing && !draftContent.trim()}
        >
          {isEditing ? "Speichern" : "Bearbeiten"}
        </button>
        <ConfirmButton
          initialLabel="Löschen"
          confirmLabel="Endgültig löschen"
          className="secondary"
          confirmClassName="danger"
          resetDelay={1200}
          onConfirm={() => onDelete(entry.id)}
        />
      </footer>
    </article>
  );
};

export default EntryCard;

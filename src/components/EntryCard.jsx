/**
 * @file EntryCard.jsx
 * @description Einzelkarte eines Logeintrags mit Inline-Bearbeitung,
 * Anzeige des Erstellungszeitpunkts und zweistufiger Löschinteraktion.
 */

import { memo, useEffect, useState } from "react";
import ConfirmButton from "./ConfirmButton.jsx";
import { PencilIcon, CheckIcon, TrashIcon } from "./icons.jsx";
import { formatDateTime } from "../utils/formatters.js";

/**
 * @typedef {Object} Entry
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string} createdAt
 * @property {string} editedAt
 */

/**
 * Ermittelt das Initial für den Avatar-Kringel – bevorzugt Titel, sonst Content.
 *
 * @param {Entry} entry Eintrag, dessen Initial berechnet werden soll.
 * @returns {string} Großbuchstabe für den Avatar-Kreis.
 */
const getInitial = (entry) => {
  const source = (entry.title || entry.content || "L").trim();
  return source.charAt(0).toUpperCase();
};

/**
 * Präsentationskomponente für einen einzelnen Logeintrag.
 * Unterstützt Inline-Bearbeitung der Inhalte sowie den zweistufigen Löschvorgang.
 *
 * @param {Object} props React-Props.
 * @param {Entry} props.entry Datensatz für die Karte.
 * @param {(id: string) => void} props.onDelete Callback zum Verschieben in den Papierkorb.
 * @param {(id: string, updates: { title?: string, content?: string }) => void} props.onUpdate
 *        Persistiert Änderungen an Titel oder Inhalt.
 * @returns {JSX.Element} Artikel mit Bearbeitungsoptionen.
 */
const EntryCard = ({ entry, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(entry.title ?? "");
  const [draftContent, setDraftContent] = useState(entry.content ?? "");

  /**
   * Wenn der Artikel nicht mehr im Edit-Modus ist, stellen wir sicher,
   * dass die Draft-Werte wieder dem Original entsprechen.
   */
  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(entry.title ?? "");
      setDraftContent(entry.content ?? "");
    }
  }, [entry.title, entry.content, isEditing]);

  /**
   * Schaltet zwischen Anzeige- und Edit-Modus um und schreibt Änderungen zurück.
   */
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
      <header className="log-entry__header">
        <div className="log-entry__title-group">
          <span className="log-entry__avatar">{getInitial(entry)}</span>
          {isEditing ? (
            <input
              type="text"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Ohne Titel"
              maxLength={120}
              className="log-entry__title-input"
            />
          ) : (
            <strong className="log-entry__title">{entry.title || "Ohne Titel"}</strong>
          )}
        </div>
        <time className="log-entry__meta" dateTime={entry.createdAt}>
          {formatDateTime(entry.createdAt)}
        </time>
      </header>
      {isEditing ? (
        <textarea
          value={draftContent}
          onChange={(event) => setDraftContent(event.target.value)}
          placeholder="Eintrag bearbeiten"
          className="log-entry__editor"
        />
      ) : (
        <p className="log-entry__content">{entry.content}</p>
      )}
      <footer className="log-entry__footer">
        <button
          type="button"
          className={isEditing ? "primary" : "secondary"}
          onClick={handleToggleEdit}
          disabled={isEditing && !draftContent.trim()}
        >
          <span className="button-icon">
            {isEditing ? <CheckIcon /> : <PencilIcon />}
          </span>
          <span className="button-label">{isEditing ? "Speichern" : "Bearbeiten"}</span>
        </button>
        <ConfirmButton
          initialLabel="Löschen"
          confirmLabel="In den Papierkorb"
          initialIcon={<TrashIcon />}
          confirmIcon={<TrashIcon />}
          className="secondary"
          confirmClassName="danger"
          resetDelay={1200}
          onConfirm={() => onDelete(entry.id)}
        />
      </footer>
    </article>
  );
};

export default memo(EntryCard);

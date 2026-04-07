/**
 * @file EntryCard.jsx
 * @description Einzelkarte eines Logeintrags mit Inline-Bearbeitung,
 * Anzeige des Erstellungszeitpunkts und zweistufiger Löschinteraktion.
 */

import { memo, useEffect, useRef, useState } from "react";
import ConfirmButton from "./ConfirmButton.jsx";
import ModalShell from "./ModalShell.jsx";
import RichTextContent from "./RichTextContent.jsx";
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
  const [isReading, setIsReading] = useState(false);
  const [isPreviewOverflowing, setIsPreviewOverflowing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(entry.title ?? "");
  const [draftContent, setDraftContent] = useState(entry.content ?? "");
  const previewRef = useRef(null);
  const wasEdited = Boolean(entry.editedAt && entry.editedAt !== entry.createdAt);

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
   * Die Kartenansicht zeigt bewusst nur eine begrenzte Vorschau. Hier messen wir,
   * ob der Inhalt tatsächlich abgeschnitten wird, um den Fade-Hinweis nur dann einzublenden.
   */
  useEffect(() => {
    if (isEditing) {
      setIsPreviewOverflowing(false);
      return undefined;
    }

    const previewElement = previewRef.current;
    if (!previewElement) {
      return undefined;
    }

    const measureOverflow = () => {
      setIsPreviewOverflowing(previewElement.scrollHeight > previewElement.clientHeight + 4);
    };

    measureOverflow();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => measureOverflow());
      resizeObserver.observe(previewElement);
      return () => resizeObserver.disconnect();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", measureOverflow);
      return () => window.removeEventListener("resize", measureOverflow);
    }

    return undefined;
  }, [entry.content, isEditing]);

  useEffect(() => {
    if (isEditing) {
      setIsReading(false);
    }
  }, [isEditing]);

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

  const handleOpenReader = () => {
    if (!isEditing) {
      setIsReading(true);
    }
  };

  const handlePreviewKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenReader();
    }
  };

  return (
    <>
      <article className="log-entry">
        <header className="log-entry__header">
          <div className="log-entry__title-stack">
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
            <div className="log-entry__chips">
              <span className="log-entry__chip">Lokal gespeichert</span>
              {wasEdited ? <span className="log-entry__chip">Bearbeitet</span> : null}
            </div>
          </div>
          <div className="log-entry__meta-group">
            <time className="log-entry__meta" dateTime={entry.createdAt}>
              Erstellt {formatDateTime(entry.createdAt)}
            </time>
            {wasEdited ? (
              <span className="log-entry__meta">
                Aktualisiert {formatDateTime(entry.editedAt)}
              </span>
            ) : null}
          </div>
        </header>
        {isEditing ? (
          <textarea
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            placeholder="Eintrag bearbeiten"
            className="log-entry__editor"
          />
        ) : (
          <div
            className={`log-entry__preview-card${isPreviewOverflowing ? " log-entry__preview-card--truncated" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`Eintrag ${entry.title || "Ohne Titel"} vollständig lesen`}
            aria-haspopup="dialog"
            onClick={handleOpenReader}
            onKeyDown={handlePreviewKeyDown}
          >
            <div
              ref={previewRef}
              className={`log-entry__preview${isPreviewOverflowing ? " log-entry__preview--truncated" : ""}`}
            >
              <RichTextContent
                className="log-entry__content log-entry__content--preview"
                content={entry.content}
              />
            </div>
            {isPreviewOverflowing ? (
              <div className="log-entry__preview-caption" aria-hidden="true">
                <span className="log-entry__preview-badge">Vorschau</span>
                <strong>Zum Lesen öffnen</strong>
              </div>
            ) : null}
          </div>
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
      {isReading ? (
        <ModalShell
          title={entry.title || "Ohne Titel"}
          eyebrow="Vollansicht"
          onClose={() => setIsReading(false)}
          dialogClassName="modal-shell__dialog--reader"
          bodyClassName="modal-shell__body--reader"
        >
          <article className="entry-reader">
            <div className="entry-reader__meta">
              <span className="log-entry__chip">Lokal gespeichert</span>
              {wasEdited ? <span className="log-entry__chip">Bearbeitet</span> : null}
              <time className="log-entry__meta" dateTime={entry.createdAt}>
                Erstellt {formatDateTime(entry.createdAt)}
              </time>
              {wasEdited ? (
                <span className="log-entry__meta">
                  Aktualisiert {formatDateTime(entry.editedAt)}
                </span>
              ) : null}
            </div>
            <RichTextContent className="entry-reader__content" content={entry.content} />
          </article>
        </ModalShell>
      ) : null}
    </>
  );
};

export default memo(EntryCard);

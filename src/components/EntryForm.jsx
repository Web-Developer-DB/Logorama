/**
 * @file EntryForm.jsx
 * @description Kontrolliertes Formular zum Erstellen neuer Einträge. Eingaben
 * werden über Callback-Props an die App weitergereicht.
 */

import { memo } from "react";

/**
 * Vollständiges Formular zum Erfassen neuer Logeinträge.
 *
 * Verantwortlichkeiten:
 * - Kapselt sämtliche Formularfelder (Titel, Inhalt) und deren Events.
 * - Delegiert Statusverwaltung nach außen, sodass `App` die Daten konsistent halten kann.
 *
 * @param {Object} props React-Props.
 * @param {{ title: string, content: string }} props.formState Kontrollierter Formularstatus.
 * @param {(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void} props.onInputChange
 *        Aktualisiert den State in der Elternkomponente.
 * @param {(event: React.FormEvent<HTMLFormElement>) => void} props.onSubmit
 *        Reicht den Submit für zusätzliche Validierung weiter.
 * @param {boolean} [props.isCompact=false] Aktiviert eine kompaktere Layout-Variante fuer Modals.
 * @returns {JSX.Element} Steuerbares Formular.
 */
const EntryForm = ({ formState, onInputChange, onSubmit, isCompact = false }) => (
  <form className={`log-form${isCompact ? " log-form--compact" : ""}`} onSubmit={onSubmit} id="new-entry">
    {isCompact ? (
      <div className="log-form__compact-head">
        <label className="log-form__field">
          <span className="log-form__label-row">
            <span>Titel (optional)</span>
            <span className="log-form__meta">Bis 120 Zeichen</span>
          </span>
          <input
            type="text"
            name="title"
            value={formState.title}
            onChange={onInputChange}
            placeholder="Stichwort oder Thema"
            maxLength={120}
          />
        </label>
        <div className="log-form__submit-cluster">
          <button type="submit" className="primary">
            Speichern
          </button>
          <p className="log-form__meta-note">Lokal gesichert und offline verfuegbar.</p>
        </div>
      </div>
    ) : (
      <label className="log-form__field">
        <span className="log-form__label-row">
          <span>Titel (optional)</span>
          <span className="log-form__meta">Bis 120 Zeichen</span>
        </span>
        <input
          type="text"
          name="title"
          value={formState.title}
          onChange={onInputChange}
          placeholder="Stichwort oder Thema"
          maxLength={120}
        />
      </label>
    )}

    <label className="log-form__field log-form__field--content">
      <span className="log-form__label-row">
        <span>Eintrag</span>
        <span className="log-form__meta">Pflichtfeld</span>
      </span>
      <textarea
        name="content"
        value={formState.content}
        onChange={onInputChange}
        placeholder="Was möchtest du festhalten?"
        required
        autoFocus={isCompact}
      />
    </label>

    <div className={`log-form__footer${isCompact ? " log-form__footer--compact" : ""}`}>
      <p className="log-form__hint">
        Dein Eintrag wird lokal im Browser gespeichert und bleibt offline verfügbar.
      </p>
      {isCompact ? null : (
        <div className="actions">
          <button type="submit" className="primary">
            Speichern
          </button>
        </div>
      )}
    </div>
  </form>
);

export default memo(EntryForm);

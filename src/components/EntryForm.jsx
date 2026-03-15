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
 * @returns {JSX.Element} Steuerbares Formular.
 */
const EntryForm = ({ formState, onInputChange, onSubmit }) => (
  <form className="log-form" onSubmit={onSubmit} id="new-entry">
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

    <label className="log-form__field">
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
      />
    </label>

    <div className="log-form__footer">
      <p className="log-form__hint">
        Dein Eintrag wird lokal im Browser gespeichert und bleibt offline verfügbar.
      </p>
      <div className="actions">
        <button type="submit" className="primary">
          Speichern
        </button>
      </div>
    </div>
  </form>
);

export default memo(EntryForm);

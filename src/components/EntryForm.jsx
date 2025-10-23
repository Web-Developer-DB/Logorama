import { memo } from "react";

/**
 * Vollständiges Formular zum Erfassen neuer Logeinträge.
 *
 * Verantwortlichkeiten:
 * - Kapselt sämtliche Formularfelder (Zeitpunkt, Titel, Inhalt) und deren Events.
 * - Delegiert Statusverwaltung nach außen, sodass `App` die Daten konsistent halten kann.
 */
const EntryForm = ({ formState, onInputChange, onSubmit }) => (
  <form className="log-form" onSubmit={onSubmit} id="new-entry">
    <label>
      Zeitpunkt
      <input
        type="datetime-local"
        name="date"
        value={formState.date}
        onChange={onInputChange}
        required
      />
    </label>

    <label>
      Titel (optional)
      <input
        type="text"
        name="title"
        value={formState.title}
        onChange={onInputChange}
        placeholder="Stichwort oder Thema"
        maxLength={120}
      />
    </label>

    <label>
      Eintrag
      <textarea
        name="content"
        value={formState.content}
        onChange={onInputChange}
        placeholder="Was möchtest du festhalten?"
        required
      />
    </label>

    <div className="actions">
      <button type="submit" className="primary">
        Speichern
      </button>
    </div>
  </form>
);

export default memo(EntryForm);

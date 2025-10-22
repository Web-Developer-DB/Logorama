import { forwardRef } from "react";

/**
 * Vollständiges Formular zum Erfassen neuer Logeinträge.
 * 
 * Verantwortlichkeiten:
 * - Kapselt sämtliche Formularfelder (Zeitpunkt, Titel, Inhalt) und deren Events.
 * - Delegiert Statusverwaltung nach außen, sodass `App` die Daten konsistent halten kann.
 * - Stellt Export- und Import-Aktionen als Buttons bereit, inklusive verstecktem File-Input.
 */
const EntryForm = forwardRef(
  (
    {
      formState,
      onInputChange,
      onSubmit,
      onExport,
      onRequestImport,
      onImportFile,
      disableExport
    },
    importInputRef
  ) => (
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
        <button
          type="button"
          className="secondary"
          onClick={onExport}
          disabled={disableExport}
        >
          Als JSON exportieren
        </button>
        <button type="button" className="secondary" onClick={onRequestImport}>
          JSON importieren
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          onChange={onImportFile}
          style={{ display: "none" }}
        />
      </div>
    </form>
  )
);

EntryForm.displayName = "EntryForm";

export default EntryForm;

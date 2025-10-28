import EntryForm from "../EntryForm.jsx";

/**
 * Stellt das Formular für neue Einträge bereit. Die Komponente erhält
 * alle Handler als Props, damit die Formularlogik zentral in den Hooks bleibt.
 */
const NewEntryPage = ({ formState, onInputChange, onSubmit }) => (
  <section className="panel">
    <header className="panel-heading">
      <h2 className="panel-title">Neuer Eintrag</h2>
      <p className="panel-subtitle">Halte neue Gedanken, Ideen oder Fortschritte direkt fest.</p>
    </header>
    <EntryForm formState={formState} onInputChange={onInputChange} onSubmit={onSubmit} />
  </section>
);

export default NewEntryPage;

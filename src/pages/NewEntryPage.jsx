/**
 * @file NewEntryPage.jsx
 * @description Route für das Formular zum Anlegen neuer Einträge.
 */

import EntryForm from "../components/EntryForm.jsx";

/**
 * Stellt das Formular für neue Einträge bereit. Die Komponente erhält
 * alle Handler als Props, damit die Formularlogik zentral in den Hooks bleibt.
 *
 * @param {Object} props React-Props.
 * @param {{ title: string, content: string }} props.formState Steuerbarer Formularzustand.
 * @param {(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void} props.onInputChange
 *        Übernimmt Eingaben in den Manager-Hook.
 * @param {(event: React.FormEvent<HTMLFormElement>) => void} props.onSubmit
 *        Validiert und erstellt neue Einträge.
 * @returns {JSX.Element} Panel mit Formular.
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

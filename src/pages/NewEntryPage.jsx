/**
 * @file NewEntryPage.jsx
 * @description Route für das Formular zum Anlegen neuer Einträge.
 */

import EntryForm from "../components/EntryForm.jsx";
import Seo from "../components/Seo.jsx";

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
  <>
    <Seo
      title="Neuen Eintrag erstellen – Logorama"
      description="Dokumentiere neue Gedanken, Tickets oder Lernfortschritte direkt im Browser – komplett offline-fähig."
      path="/new"
      keywords="Neuer Log, Eintrag erstellen, Notiz hinzufügen, Lernjournal erstellen"
    />
    <section className="new-entry-layout">
      <section className="panel panel--editor">
        <header className="panel-heading">
          <p className="panel-eyebrow">Neue Notiz</p>
          <h2 className="panel-title">Neuer Eintrag</h2>
          <p className="panel-subtitle">
            Halte neue Gedanken, Ideen oder Fortschritte direkt fest.
          </p>
        </header>
        <EntryForm formState={formState} onInputChange={onInputChange} onSubmit={onSubmit} />
      </section>
      <aside className="panel panel--aside" aria-labelledby="new-entry-tips-title">
        <header className="panel-heading">
          <p className="panel-eyebrow">Leitfaden</p>
          <h2 id="new-entry-tips-title" className="panel-title">
            Ruhig schreiben
          </h2>
          <p className="panel-subtitle">
            Wenige Felder, klare Priorität: Inhalt zuerst, Metadaten nur bei Bedarf.
          </p>
        </header>
        <ul className="info-list">
          <li>Titel ist optional und eignet sich für Thema, Projekt oder Ticketnummer.</li>
          <li>Der eigentliche Eintrag bleibt die primäre Arbeitsfläche und nimmt bewusst mehr Raum ein.</li>
          <li>Nach dem Speichern landest du direkt wieder in der Übersicht deiner Einträge.</li>
        </ul>
      </aside>
    </section>
  </>
);

export default NewEntryPage;

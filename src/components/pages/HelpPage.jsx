/**
 * Statische Hilfe-Seite mit einem Überblick über Navigation und Funktionen.
 * Die Inhalte wurden 1:1 aus der ursprünglichen App übernommen.
 */
const HelpPage = () => (
  <section className="panel">
    <header className="panel-heading">
      <h2 className="panel-title">Hilfe &amp; Einstieg</h2>
      <p className="panel-subtitle">
        So nutzt du Logorama – Übersicht der wichtigsten Bereiche, Workflows und Sicherungsoptionen.
      </p>
    </header>
    <div className="help-content">
      <div>
        <h3>Erste Schritte</h3>
        <p>
          Die Startseite liefert Kennzahlen zu deinen Logs, zeigt die drei neuesten Einträge und hält
          die wichtigsten Aktionen bereit.
        </p>
        <ul>
          <li>
            <strong>Neuen Eintrag starten:</strong> Über den Button „Neuantrag erstellen“ gelangst du
            direkt zum Formular <em>Neuer Eintrag</em>.
          </li>
          <li>
            <strong>Theme wechseln:</strong> Der Schalter neben dem Button erlaubt System-, Hell- oder
            Dunkelmodus.
          </li>
          <li>
            <strong>PWA installieren:</strong> Unterstützt dein Browser Progressive Web Apps, erscheint
            zusätzlich der Button „App installieren“.
          </li>
        </ul>
      </div>
      <div>
        <h3>Einträge verfassen &amp; organisieren</h3>
        <ul>
          <li>
            <strong>Formular:</strong> Titel ist optional, der Inhalt Pflicht. Nach dem Speichern
            landen neue Einträge automatisch in der Übersicht „Einträge“.
          </li>
          <li>
            <strong>Inline-Bearbeitung:</strong> Öffne den Tab „Einträge“, um Inhalte direkt in der
            Karte zu bearbeiten oder in den Papierkorb zu verschieben.
          </li>
          <li>
            <strong>Suche &amp; Filter:</strong> Nutze die Stichwortsuche sowie die Filter „Heute“ und
            „Letzte 7 Tage“, um deine Liste gezielt einzugrenzen.
          </li>
        </ul>
      </div>
      <div>
        <h3>Papierkorb &amp; Sicherheit</h3>
        <ul>
          <li>
            <strong>Wiederherstellen:</strong> Gelöschte Einträge lassen sich mit einem Klick
            zurückholen – inklusive aller Inhalte und Zeitstempel.
          </li>
          <li>
            <strong>Endgültig löschen:</strong> Der zweistufige Button sorgt dafür, dass du dich nicht
            versehentlich vom falschen Eintrag trennst.
          </li>
          <li>
            <strong>Automatische Bereinigung:</strong> Alles, was länger als 30 Tage im Papierkorb
            liegt, räumt Logorama stündlich selbstständig auf.
          </li>
          <li>
            <strong>Papierkorb leeren:</strong> Über den Sammel-Button entfernst du den kompletten
            Papierkorb nach einer Bestätigung.
          </li>
        </ul>
      </div>
      <div>
        <h3>Backups &amp; Synchronisierung</h3>
        <ul>
          <li>
            <strong>JSON-Export:</strong> Sichere deine Daten lokal – bei modernen Browsern sogar über
            den nativen Dateiauswahldialog.
          </li>
          <li>
            <strong>JSON-Import:</strong> Spiele Sicherungen über den Button „Daten wiederherstellen“
            wieder ein; das System ersetzt den kompletten Datenbestand.
          </li>
          <li>
            <strong>Google Drive:</strong> Aktiviere den Toggle, um automatische Sicherungen in deinem
            Drive-AppData-Ordner anzulegen. Über „Jetzt synchronisieren“ oder „Aus Google Drive
            laden“ stößt du Aktionen manuell an.
          </li>
        </ul>
      </div>
      <div>
        <h3>Code &amp; Lizenz</h3>
        <p>
          Logorama steht unter der MIT License. Die modulare React-Codebasis ist öffentlich einsehbar
          und kann nach Belieben erweitert werden.
        </p>
        <ul>
          <li>
            <a
              href="https://github.com/Web-Developer-DB/Logorama"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source Code auf GitHub
            </a>
          </li>
          <li>
            Weitere technische Details findest du in der <code>README.md</code> im Projektstamm.
          </li>
        </ul>
      </div>
    </div>
  </section>
);

export default HelpPage;

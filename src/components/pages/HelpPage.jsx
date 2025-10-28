/**
 * Statische Hilfe-Seite mit einem Überblick über Navigation und Funktionen.
 * Die Inhalte wurden 1:1 aus der ursprünglichen App übernommen.
 */
const HelpPage = () => (
  <section className="panel">
    <header className="panel-heading">
      <h2 className="panel-title">Hilfe &amp; Einstieg</h2>
      <p className="panel-subtitle">
        So nutzt du Logorama – kurzer Überblick über Navigation und Kernfunktionen.
      </p>
    </header>
    <div className="help-content">
      <h3>Navigation</h3>
      <ul>
        <li>
          <strong>Home:</strong> Dashboard mit Kennzahlen, den drei aktuellsten Einträgen und dem
          Button „Neuantrag erstellen“ für neue Notizen.
        </li>
        <li>
          <strong>Einträge:</strong> Gesamte Liste mit Suche und Filter nach Zeitraum.
        </li>
        <li>
          <strong>Papierkorb:</strong> Gelöschte Einträge zur Wiederherstellung oder endgültigen
          Löschung. Einträge werden hier automatisch nach 30 Tagen entfernt.
        </li>
        <li>
          <strong>Backup:</strong> Exportiere oder importiere deine Daten als JSON-Datei.
        </li>
      </ul>
      <h3>Tipps zum Start</h3>
      <ul>
        <li>Nutze den Button „Neuantrag erstellen“, um deine ersten Notizen zu erfassen.</li>
        <li>Der Filter „Heute anzeigen“ zeigt dir nur die Einträge des aktuellen Tags.</li>
        <li>
          Über den Theme-Switch auf der Home-Seite kannst du zwischen System-, Licht- und Dunkelmodus
          wechseln.
        </li>
        <li>Sichere deine Daten regelmäßig über den Menüpunkt „Backup“.</li>
      </ul>
      <h3>Lizenz &amp; Komponenten</h3>
      <p>
        Logorama steht unter der MIT License. Der komplette Source Code inklusive aller
        React-Komponenten befindet sich auf GitHub und kann frei eingesehen oder erweitert werden.
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
          Wichtige Module: <code>App.jsx</code>, <code>MobileNav.jsx</code>, <code>ThemeToggle.jsx</code>,{" "}
          <code>ActiveEntriesSection.jsx</code>, <code>TrashSection.jsx</code>,{" "}
          <code>DataSafetyPanel.jsx</code>.
        </li>
      </ul>
    </div>
  </section>
);

export default HelpPage;

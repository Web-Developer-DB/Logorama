import { useCallback } from "react";

/**
 * @file HelpPage.jsx
 * @description Interaktive Hilfe mit praxisnahen Schritt-für-Schritt-Anleitungen,
 * abgestimmt auf die Screens der App.
 */
const HelpPage = () => {
  const tocItems = [
    { id: "overview", label: "Schnellüberblick" },
    { id: "create-entry", label: "Neuen Eintrag anlegen" },
    { id: "manage-entries", label: "Einträge verwalten" },
    { id: "trash", label: "Papierkorb nutzen" },
    { id: "backup", label: "Backup & Restore" },
    { id: "faq", label: "Tipps & FAQ" }
  ];

  /**
   * Scrollt weich zum gewünschten Abschnitt, ohne die HashRouter-Route zu verändern.
   */
  const handleInlineNavigation = useCallback((sectionId) => {
    if (typeof document === "undefined") {
      return;
    }
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });

    const focusTarget =
      section.querySelector("h3, h2, h1, [tabindex]") ?? section;
    if (focusTarget && typeof focusTarget.setAttribute === "function") {
      focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus({ preventScroll: true });
      focusTarget.addEventListener(
        "blur",
        () => focusTarget.removeAttribute("tabindex"),
        { once: true }
      );
    }
  }, []);

  return (
    <section className="panel help-panel" aria-labelledby="help-title">
      <header className="panel-heading">
        <h2 id="help-title" className="panel-title">
          Hilfe &amp; Einstieg
        </h2>
        <p className="panel-subtitle">
          So nutzt du Logorama von der ersten Notiz bis zum Backup – abgestimmt auf die aktuelle
          Oberfläche der App.
        </p>
      </header>

      <nav aria-label="Schnellnavigation" className="help-content__toc">
        <h3 className="help-content__toc-title">Direkt zu</h3>
        <ul>
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="help-content__toc-button"
                onClick={() => handleInlineNavigation(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="help-content">
        <section id="overview" aria-labelledby="overview-heading">
          <h3 id="overview-heading">Schnellüberblick</h3>
          <p>
            Logorama ist dein persönliches Lernjournal. Auf der <strong>Home</strong>-Seite siehst
            du den Titelbereich mit Beschreibung, Kennzahlen zu deinen Logs und den Button{" "}
            <em>Neuantrag erstellen</em>. Am unteren Rand befindet sich die permanente Navigation
            mit den Tabs <em>Home</em>, <em>Einträge</em>, <em>Papierkorb</em>,{" "}
            <em>Backup</em> und <em>Hilfe</em> (du bist hier).
          </p>
          <ul>
            <li>
              <strong>Schnelleinstieg:</strong> Starte einen neuen Log direkt über den CTA auf der
              Startseite oder den Tab <em>Neuer Eintrag</em>.
            </li>
            <li>
              <strong>Überblick:</strong> Die Kennzahlen zeigen, wie viele Einträge du insgesamt,
              heute, diese Woche und im Papierkorb hast.
            </li>
            <li>
              <strong>Aktuelle Einträge:</strong> Die drei neuesten Logs werden als Vorschau auf der
              Startseite angezeigt – perfekt für einen schnellen Rückblick.
            </li>
          </ul>
          <figure className="help-content__figure">
            <img
              src="/images/help/home.webp"
              alt="Startseite von Logorama mit Kennzahlen, Call-to-Action und Navigation."
              loading="lazy"
              className="help-content__image"
            />
            <figcaption>
              Die Home-Ansicht zeigt Kennzahlen, aktuelle Einträge und den Schnellzugriff auf neue
              Logs.
            </figcaption>
          </figure>
        </section>

        <section id="create-entry" aria-labelledby="create-entry-heading">
          <h3 id="create-entry-heading">Neuen Eintrag anlegen</h3>
          <ol>
            <li>
              Wechsle zum Tab <strong>Neuer Eintrag</strong> oder nutze den Button{" "}
              <em>Neuantrag erstellen</em> auf <em>Home</em>.
            </li>
            <li>
              Trage optional einen <strong>Titel</strong> (Stichwort oder Thema) ein. Das Feld{" "}
              <em>Eintrag</em> ist Pflicht – hier dokumentierst du Gedanken, Fortschritte oder
              Ideen.
            </li>
            <li>
              Klicke auf <em>Speichern</em>. Der Button wird aktiv, sobald der Eintrag nicht mehr
              leer ist. Nach dem Speichern wechselt die App automatisch zur Übersicht der Einträge.
            </li>
          </ol>
          <p>
            Hinweis: Die Browser-Rechtschreibprüfung hilft dir beim Korrigieren. Unbekannte Wörter
            erscheinen rot unterstrichen, wie im Lorem-Ipsum-Beispiel.
          </p>
          <figure className="help-content__figure">
            <div className="help-content__figure-grid">
              <img
                src="/images/help/new-entry-empty.webp"
                alt="Neuer Eintrag: leeres Formular mit Titel- und Eintragsfeld."
                loading="lazy"
                className="help-content__image"
              />
              <img
                src="/images/help/new-entry-filled.webp"
                alt="Neuer Eintrag: Formular mit ausgefülltem Text und aktivem Speichern-Button."
                loading="lazy"
                className="help-content__image"
              />
            </div>
            <figcaption>
              Links: leere Eingabemaske. Rechts: ausgefüllter Log mit aktivem Button und
              Rechtschreibprüfung.
            </figcaption>
          </figure>
        </section>

        <section id="manage-entries" aria-labelledby="manage-entries-heading">
          <h3 id="manage-entries-heading">Einträge verwalten</h3>
          <p>
            Der Tab <strong>Einträge</strong> listet jede Notiz als Karte mit Titel, Log-Nummer,
            Datum und Inhalt. Oben stehen dir Suchfeld und Dropdown zur Verfügung, um schnell zu
            filtern.
          </p>
          <ul>
            <li>
              <strong>Bearbeiten:</strong> Klicke auf <em>Bearbeiten</em>, passe deinen Text an und
              bestätige erneut mit <em>Speichern</em>.
            </li>
            <li>
              <strong>Löschen:</strong> Mit <em>Löschen</em> verschiebst du einen Log in den Tab{" "}
              <em>Papierkorb</em>. Er bleibt dort erhalten, bis du ihn endgültig entfernst.
            </li>
            <li>
              <strong>Badges:</strong> Kleine Zähler an den Tabs zeigen dir, wie viele Einträge oder
              gelöschte Elemente aktuell vorhanden sind.
            </li>
          </ul>
          <figure className="help-content__figure">
            <img
              src="/images/help/entries-list.webp"
              alt="Einträge-Tab mit Filterleiste, Suchfeld und einer Eintragskarte."
              loading="lazy"
              className="help-content__image"
            />
            <figcaption>
              Filter nach Stichworten und Zeitraum helfen, Einträge schnell zu finden. Aktionen für
              Bearbeiten und Löschen befinden sich am Kartenende.
            </figcaption>
          </figure>
        </section>

        <section id="trash" aria-labelledby="trash-heading">
          <h3 id="trash-heading">Papierkorb nutzen</h3>
          <p>
            Alles, was du löschst, landet zunächst im <strong>Papierkorb</strong>. Jede Karte zeigt
            das ursprüngliche Erstellungsdatum sowie den Zeitpunkt der Löschung.
          </p>
          <ul>
            <li>
              <strong>Wiederherstellen:</strong> Hol den Eintrag zurück in den Tab{" "}
              <em>Einträge</em>.
            </li>
            <li>
              <strong>Dauerhaft löschen:</strong> Entfernt den Log endgültig – ideal, wenn du
              aufräumen willst.
            </li>
            <li>
              <strong>Papierkorb leeren:</strong> Ein Klick entfernt alle gelöschten Einträge. Diese
              Aktion kann nicht rückgängig gemacht werden.
            </li>
          </ul>
          <figure className="help-content__figure">
            <img
              src="/images/help/trash.webp"
              alt="Papierkorb-Tab mit wiederherstellbarem Eintrag und Buttonleiste."
              loading="lazy"
              className="help-content__image"
            />
            <figcaption>
              Jeder gelöschte Log zeigt Erstell- und Löschdatum. Nutze die Buttons für schnelle
              Wiederherstellung oder vollständiges Entfernen.
            </figcaption>
          </figure>
        </section>

        <section id="backup" aria-labelledby="backup-heading">
          <h3 id="backup-heading">Backup &amp; Restore</h3>
          <p>
            Über den Tab <strong>Backup</strong> exportierst du deine Daten als JSON-Datei oder
            spielst vorhandene Sicherungen wieder ein – ideal für Gerätewechsel oder als Schutz vor
            Datenverlust.
          </p>
          <ol>
            <li>
              Wähle <em>Daten sichern (Upload)</em>, um eine aktuelle Sicherung herunterzuladen.
              Lege die Datei lokal oder in deiner Cloud ab.
            </li>
            <li>
              Mit <em>Daten wiederherstellen (Download)</em> importierst du eine bestehende Sicherung.
              Der Import ersetzt den kompletten Datenbestand – erstelle daher vorher ein frisches
              Backup, falls du nichts verlieren möchtest.
            </li>
            <li>
              Der Tipp im violetten Hinweisfeld erinnert dich daran, regelmäßig Sicherungen anzulegen,
              damit du Änderungen jederzeit rückgängig machen kannst.
            </li>
          </ol>
          <p>
            Logorama prüft beim Import das Dateiformat. Bei Fehlern bekommst du einen klaren Hinweis,
            ohne dass vorhandene Einträge überschrieben werden.
          </p>
          <figure className="help-content__figure">
            <img
              src="/images/help/backup.webp"
              alt="Backup-Tab mit Buttons für Export und Import sowie Hinweistext."
              loading="lazy"
              className="help-content__image"
            />
            <figcaption>
              Exportiere Logs als JSON oder spiele alte Sicherungen ein. Der Hinweis erinnert an
              regelmäßige Backups.
            </figcaption>
          </figure>
        </section>

        <section id="faq" aria-labelledby="faq-heading">
          <h3 id="faq-heading">Tipps &amp; FAQ</h3>
          <dl>
            <div>
              <dt>Kann ich die App offline nutzen?</dt>
              <dd>
                Ja, Logorama speichert alles lokal. Nachdem du die App einmal geöffnet hast,
                funktioniert sie auch ohne Internetverbindung weiter.
              </dd>
            </div>
            <div>
              <dt>Wie installiere ich Logorama als PWA?</dt>
              <dd>
                Auf der Home-Seite erscheint der Button <em>App installieren</em>, sobald dein
                Browser das erlaubt. Klicke darauf, um ein Icon auf dem Startbildschirm zu erhalten.
              </dd>
            </div>
            <div>
              <dt>Warum sehe ich rote Markierungen im Textfeld?</dt>
              <dd>
                Das ist die Rechtschreibprüfung deines Browsers. Sie hilft dir beim Korrigieren,
                ohne dass zusätzliche Tools notwendig sind.
              </dd>
            </div>
            <div>
              <dt>Was, wenn ich den Papierkorb vergesse?</dt>
              <dd>
                Ein Badge in der Navigation erinnert dich an Inhalte im Papierkorb. Kombiniere das
                mit regelmäßigen Backups, um nichts zu verlieren.
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <footer className="help-content__footer" aria-label="Weiterführende Ressourcen">
        <p>
          Noch Fragen? Lies die <code>README.md</code> für Setup &amp; Architekturhinweise oder den{" "}
          <code>CHANGELOG.md</code> für Release-Notizen. Feedback kannst du jederzeit im Repository
          dokumentieren.
        </p>
      </footer>
    </section>
  );
};

export default HelpPage;

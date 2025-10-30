import { useCallback } from "react";

/**
 * @file HelpPage.jsx
 * @description In-App-Hilfebereich mit Schritt-für-Schritt-Anleitungen, Verweisen auf
 * Projektdateien und Troubleshooting-Hinweisen speziell für Einsteiger:innen.
 */
const HelpPage = () => {
  const tocItems = [
    { id: "quickstart", label: "Erste Schritte" },
    { id: "core-concepts", label: "Grundkonzepte" },
    { id: "tutorial", label: "Mini-Tutorial" },
    { id: "troubleshooting", label: "Troubleshooting & FAQ" },
    { id: "shortcuts", label: "Tastaturkürzel" },
    { id: "offline", label: "Offline & PWA" }
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
          Diese Seite fasst alle Kernfunktionen von Logorama zusammen: von der ersten Notiz über
          Backups bis zum Offline-Einsatz der PWA.
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
        <section id="quickstart" aria-labelledby="quickstart-heading">
          <h3 id="quickstart-heading">Erste Schritte (Schnellstart)</h3>
        <ol>
          <li>
            Öffne die Startseite <strong>Home</strong>: Du siehst Kennzahlen, den Button{" "}
            <em>Neuantrag erstellen</em> und ggf. <em>App installieren</em>.
          </li>
          <li>
            Wähle <strong>Neuantrag erstellen</strong>, fülle mindestens das Feld{" "}
            <em>Eintrag</em> aus und bestätige mit <em>Speichern</em>.
          </li>
          <li>
            Navigiere zum Tab <strong>Einträge</strong>, um deinen neuen Log zu prüfen, zu
            bearbeiten oder zu löschen.
          </li>
          <li>
            Sichere deine Daten über <strong>Backup</strong> &rarr; <em>Daten sichern</em>.
            Die JSON-Datei kannst du lokal ablegen oder in die Cloud kopieren.
          </li>
        </ol>
        <figure className="help-content__figure">
          <div className="help-content__figure-placeholder" role="presentation">
            [Screenshot: Home-Seite mit Hero, Kennzahlen und Call-to-Actions]
          </div>
          <figcaption>
            Layout-Referenz für den Einstieg. Einen aktuellen Screenshot kannst du leicht per{" "}
            <code>npm run dev</code> erstellen.
          </figcaption>
        </figure>
      </section>

      <section id="core-concepts" aria-labelledby="core-concepts-heading">
        <h3 id="core-concepts-heading">Grundkonzepte</h3>
        <dl>
          <div>
            <dt>Einträge</dt>
            <dd>
              Jeder Log besteht aus optionalem Titel, Pflichtinhalt und Zeitstempeln. Die
              Datenverwaltung liegt im Hook <code>src/hooks/useEntriesManager.js</code>.
            </dd>
          </div>
          <div>
            <dt>Navigation</dt>
            <dd>
              Desktop- und Mobilnavigation nutzen dieselbe Modellfunktion{" "}
              <code>buildNavItems</code> in <code>src/utils/navItems.jsx</code>. Badges zeigen
              Statistikwerte aus der App.
            </dd>
          </div>
          <div>
            <dt>Papierkorb</dt>
            <dd>
              Gelöschte Einträge landen im Tab <strong>Papierkorb</strong>. Ein stündlicher Job
              (siehe <code>useEntriesManager</code>) entfernt Elemente, die älter als 30 Tage sind.
            </dd>
          </div>
          <div>
            <dt>Backups</dt>
            <dd>
              Der Bereich <strong>Backup</strong> verwendet das <code>DataSafetyPanel</code>, um
              JSON-Exporte/-Importe anzustoßen. Der Import ersetzt den kompletten Datenbestand –
              lege daher vor dem Import eine Sicherung deiner aktuellen Daten an.
            </dd>
          </div>
          <div>
            <dt>Tests</dt>
            <dd>
              UI-Regressions-Tests liegen direkt neben den Komponenten (
              <code>*.test.jsx</code>). Für neue Tests empfehlen wir das Arrange-Act-Assert-Muster,
              wie in <code>HomePage.test.jsx</code> dokumentiert.
            </dd>
          </div>
        </dl>
      </section>

      <section id="tutorial" aria-labelledby="tutorial-heading">
        <h3 id="tutorial-heading">Mini-Tutorial: Log anlegen, bearbeiten, sichern</h3>
        <ol>
          <li>
            <strong>Log erstellen:</strong> Tab <em>Neuer Eintrag</em> öffnen, Text schreiben,
            speichern. Nach Erfolg landet der Log automatisch im Tab <em>Einträge</em>.
          </li>
          <li>
            <strong>Inline bearbeiten:</strong> In der Liste <em>Einträge</em> auf{" "}
            <em>Bearbeiten</em> klicken. Änderungen werden bei <em>Speichern</em> validiert –
            leere Inhalte sind nicht erlaubt.
          </li>
          <li>
            <strong>Papierkorb testen:</strong> Einen Eintrag über <em>Löschen</em> →{" "}
            <em>In den Papierkorb</em> verschieben. Im Tab <em>Papierkorb</em> kannst du ihn
            wiederherstellen oder endgültig löschen.
          </li>
          <li>
            <strong>Backup durchführen:</strong> Zum Tab <em>Backup</em> wechseln,{" "}
            <em>Daten sichern</em> wählen und die JSON-Datei speichern. Optional kannst du über{" "}
            <em>Daten wiederherstellen</em> ein vorhandenes Backup einspielen.
          </li>
        </ol>
        <p>
          Alle oben genannten Flows sind in den automatisierten Tests verankert (siehe{" "}
          <code>src/components/pages/*Page.test.jsx</code>), sodass du bei Änderungen schnell
          regressionsfrei bleibst.
        </p>
      </section>

      <section id="troubleshooting" aria-labelledby="troubleshooting-heading">
        <h3 id="troubleshooting-heading">Troubleshooting &amp; FAQ</h3>
        <dl>
          <div>
            <dt>„Speichern“ reagiert nicht</dt>
            <dd>
              Prüfe, ob das Feld <em>Eintrag</em> wirklich Inhalt enthält. Leere Einträge blockt
              die Validierung in <code>EntryForm.jsx</code> sowie der Hook <code>handleSubmit</code>
              ab.
            </dd>
          </div>
          <div>
            <dt>Import schlägt fehl</dt>
            <dd>
              Stelle sicher, dass die JSON-Datei ein Array von Einträgen enthält.{" "}
              <code>normalizeEntriesPayload</code> wirft sonst eine verständliche Fehlermeldung;
              die App zeigt ein Alert an.
            </dd>
          </div>
          <div>
            <dt>Service Worker aktualisiert sich nicht</dt>
            <dd>
              Lösche den Cache in der Browser-DevTools-Konsole und lade neu. Jede neue Version der
              App erhöht den <code>CACHE_NAME</code> in <code>public/service-worker.js</code>, was
              alte Assets invalidiert.
            </dd>
          </div>
          <div>
            <dt>Tests schlagen im CI fehl</dt>
            <dd>
              Führe lokal <code>npm run test:ci</code> aus. Der Befehl generiert Coverage und nutzt
              identische Jest-Einstellungen wie die Pipeline (<code>jest.config.mjs</code>).
            </dd>
          </div>
        </dl>
      </section>

      <section id="shortcuts" aria-labelledby="shortcuts-heading">
        <h3 id="shortcuts-heading">Tastaturkürzel &amp; Bedienungshilfen</h3>
        <ul>
          <li>
            <strong>Strg/⌘ + K:</strong> Fokus auf das Suchfeld im Tab <em>Einträge</em> setzen
            (über Standardverhalten des Browsers für Suche; optional lässt sich ein eigener Handler
            ergänzen).
          </li>
          <li>
            <strong>Tabstopps:</strong> Alle Buttons und Links sind per Tastatur erreichbar. Die
            Fokusdarstellung wird über CSS-Variablen gesteuert (siehe <code>styles.css</code>).
          </li>
          <li>
            <strong>Screenreader-Texte:</strong> Navigationslinks besitzen aussagekräftige Labels,
            Icons sind per <code>aria-hidden</code> vom Accessibility-Tree ausgeschlossen.
          </li>
        </ul>
      </section>

      <section id="offline" aria-labelledby="offline-heading">
        <h3 id="offline-heading">Offline &amp; PWA</h3>
        <p>
          Logorama funktioniert vollständig offline. Der Service Worker in{" "}
          <code>public/service-worker.js</code> nutzt eine Stale-While-Revalidate-Strategie für
          interne Assets und eine Cache-First-Strategie für externe Ressourcen. Das Manifest{" "}
          <code>public/manifest.webmanifest</code> liefert Icons, Start-URL und Shortcuts.
        </p>
        <p>
          Installation auf dem Homescreen: Nutze den Button <em>App installieren</em>, sobald dein
          Browser das <code>beforeinstallprompt</code>-Event auslöst. Der Hook{" "}
          <code>useInstallPrompt.js</code> speichert das Event, bis du aktiv installierst.
        </p>
        <ul>
          <li>
            <strong>Performance-Ziel:</strong> Lighthouse PWA &amp; Performance &gt; 90.
          </li>
          <li>
            <strong>Offline-Fallback:</strong> Wenn eine Seite nicht verfügbar ist, liefert der
            Worker <code>index.html</code> – deine Navigationsleisten bleiben somit intakt.
          </li>
          <li>
            <strong>HTTPS-Hinweis:</strong> Auf produktiven Deployments muss die App über HTTPS
            erreichbar sein, damit Service Worker und Installation funktionieren.
          </li>
        </ul>
      </section>
    </div>

    <footer className="help-content__footer" aria-label="Weiterführende Ressourcen">
      <p>
        Noch Fragen? Sieh dir die <code>README.md</code> für Setup &amp; Architekturhinweise und
        den <code>CHANGELOG.md</code> für Release-Notizen an. Für Issues oder Feature-Ideen steht dir
        das GitHub-Repository jederzeit offen.
      </p>
    </footer>
    </section>
  );
};

export default HelpPage;

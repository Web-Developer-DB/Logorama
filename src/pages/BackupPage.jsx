/**
 * @file BackupPage.jsx
 * @description Route zur Datensicherung. Reicht die Handler unverändert an das
 * `DataSafetyPanel` weiter, damit sich die Seite auf das Layout konzentriert.
 */

import DataSafetyPanel from "../components/DataSafetyPanel.jsx";
import Seo from "../components/Seo.jsx";

/**
 * Präsentationsseite für Backups. Die JSON-Aktionen werden aus der App
 * durchgereicht, damit sich die Seite auf das UI konzentriert.
 *
 * @param {Object} props React-Props.
 * @param {() => void} props.onExport Exportiert die aktuelle Eintragsliste.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onImportFile
 *        Liest eine hochgeladene JSON-Datei.
 * @param {boolean} props.disableExport Sperrt den Download, wenn keine Einträge existieren.
 * @returns {JSX.Element} Panel mit Backup-Aktionen.
 */
const BackupPage = ({
  onExport,
  onImportFile,
  disableExport
}) => (
  <>
    <Seo
      title="Backup & Restore – Logorama"
      description="Erstelle ein JSON-Backup deines Lernjournals oder importiere bestehende Logs – ideal für Versionsstände oder Gerätewechsel."
      path="/backup"
      noindex
      keywords="JSON Export, Logorama Backup, Datenimport, Notizen sichern"
    />
    <DataSafetyPanel
      onExport={onExport}
      onImportFile={onImportFile}
      disableExport={disableExport}
    />
  </>
);

export default BackupPage;

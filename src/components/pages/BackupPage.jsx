/**
 * @file BackupPage.jsx
 * @description Route zur Datensicherung. Reicht die Handler unverändert an das
 * `DataSafetyPanel` weiter, damit sich die Seite auf das Layout konzentriert.
 */

import DataSafetyPanel from "../DataSafetyPanel.jsx";

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
  <DataSafetyPanel onExport={onExport} onImportFile={onImportFile} disableExport={disableExport} />
);

export default BackupPage;

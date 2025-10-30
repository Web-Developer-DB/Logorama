import DataSafetyPanel from "../DataSafetyPanel.jsx";

/**
 * Präsentationsseite für Backups. Die JSON-Aktionen werden aus der App
 * durchgereicht, damit sich die Seite auf das UI konzentriert.
 */
const BackupPage = ({
  onExport,
  onImportFile,
  disableExport
}) => (
  <DataSafetyPanel onExport={onExport} onImportFile={onImportFile} disableExport={disableExport} />
);

export default BackupPage;

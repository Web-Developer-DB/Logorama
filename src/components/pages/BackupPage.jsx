import DataSafetyPanel from "../DataSafetyPanel.jsx";

/**
 * Stellt das Backup-Panel inklusive Datei-Import/-Export und Drive-Optionen dar.
 * Alle Aktionen werden als Props weitergereicht, sodass der Seiten-Container
 * keine eigene Geschäftslogik enthält.
 */
const BackupPage = ({
  onExport,
  onImportFile,
  disableExport,
  driveSyncEnabled,
  onToggleDriveSync,
  driveStatus,
  driveLastSync,
  driveError,
  onDriveSync,
  onDriveRestore,
  driveIsSyncing
}) => (
  <DataSafetyPanel
    onExport={onExport}
    onImportFile={onImportFile}
    disableExport={disableExport}
    driveSyncEnabled={driveSyncEnabled}
    onToggleDriveSync={onToggleDriveSync}
    driveStatus={driveStatus}
    driveLastSync={driveLastSync}
    driveError={driveError}
    onDriveSync={onDriveSync}
    onDriveRestore={onDriveRestore}
    driveIsSyncing={driveIsSyncing}
  />
);

export default BackupPage;

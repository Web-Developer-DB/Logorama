import { memo, useMemo, useRef } from "react";
import { formatDateTime } from "../utils/formatters.js";

/**
 * Kompakte Sicherungszentrale für Export & Import.
 * Die eigentliche Logik wird von der aufrufenden Komponente (App) via Props geliefert.
 */
const DataSafetyPanel = ({
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
}) => {
  const fileInputRef = useRef(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    onImportFile?.(event);
    // Input zurücksetzen, damit derselbe Dateiname erneut gewählt werden kann.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDriveToggle = () => {
    onToggleDriveSync?.();
  };

  const handleManualSync = () => {
    onDriveSync?.();
  };

  const handleDriveRestore = () => {
    onDriveRestore?.();
  };

  const driveStatusText = useMemo(() => {
    if (!driveSyncEnabled) {
      return "Deaktiviert";
    }
    switch (driveStatus) {
      case "connecting":
        return "Verbindung wird hergestellt…";
      case "syncing":
        return "Synchronisation läuft…";
      case "connected":
        return "Verbunden";
      case "error":
        return "Fehler bei der Synchronisation";
      default:
        return "Aktiv";
    }
  }, [driveStatus, driveSyncEnabled]);

  const lastSyncText = driveLastSync ? formatDateTime(driveLastSync) : "Noch keine Synchronisierung";
  const manualActionsDisabled =
    !driveSyncEnabled || driveStatus === "connecting" || driveIsSyncing;

  return (
    <section className="panel data-safety-panel">
      <header className="panel-heading">
        <h2 className="panel-title">Daten sichern &amp; wiederherstellen</h2>
        <p className="panel-subtitle">
          Exportiere deine Einträge als JSON oder spiele vorhandene Sicherungen wieder ein.
        </p>
      </header>
      <p>
        Lade eine Sicherung deiner Einträge herunter oder spiele sie bei Bedarf wieder ein. So kannst
        du Inhalte jederzeit retten – auch wenn etwas versehentlich gelöscht wurde.
      </p>
      <div className="actions">
        <button type="button" className="primary" onClick={onExport} disabled={disableExport}>
          Daten sichern (Upload)
        </button>
        <button type="button" className="secondary" onClick={handleRestoreClick}>
          Daten wiederherstellen (Download)
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="visually-hidden"
      />
      <div className="drive-sync">
        <h3>Automatische Google&nbsp;Drive Synchronisierung</h3>
        <p>
          Synchronisiere deine Einträge automatisch mit Google Drive. Auf Wunsch kannst du die
          Sicherung jederzeit manuell anstoßen oder den neuesten Stand aus der Cloud laden.
        </p>
        <label className="drive-sync__toggle">
          <input
            type="checkbox"
            checked={!!driveSyncEnabled}
            onChange={handleDriveToggle}
            disabled={driveStatus === "connecting" || driveIsSyncing}
          />
          <span>Mit Google Drive synchronisieren</span>
        </label>
        <ul className="drive-sync__meta">
          <li>
            <strong>Status:</strong> {driveStatusText}
          </li>
          <li>
            <strong>Letzte Synchronisierung:</strong> {lastSyncText}
          </li>
        </ul>
        {driveError ? <p className="drive-sync__error">{driveError}</p> : null}
        <div className="drive-sync__actions">
          <button
            type="button"
            className="secondary"
            onClick={handleManualSync}
            disabled={manualActionsDisabled}
          >
            Jetzt synchronisieren
          </button>
          <button
            type="button"
            className="ghost"
            onClick={handleDriveRestore}
            disabled={manualActionsDisabled}
          >
            Aus Google Drive laden
          </button>
        </div>
      </div>
    </section>
  );
};

export default memo(DataSafetyPanel);

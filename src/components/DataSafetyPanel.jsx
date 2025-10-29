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
  driveStatus,
  driveLastSync,
  driveError,
  driveIsConnected,
  driveIsBusy,
  onDriveConnect,
  onDrivePull,
  onDrivePush
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

  const handleDriveConnect = () => {
    onDriveConnect?.();
  };

  const handleDrivePull = () => {
    onDrivePull?.();
  };

  const handleDrivePush = () => {
    onDrivePush?.();
  };

  const driveStatusText = useMemo(() => {
    switch (driveStatus) {
      case "connecting":
        return "Verbindung wird hergestellt…";
      case "connected":
        return "Verbunden";
      case "loading":
        return "Lädt Daten…";
      case "saving":
        return "Speichert Daten…";
      case "error":
        return "Fehler bei der Synchronisierung";
      default:
        return "Nicht verbunden";
    }
  }, [driveStatus]);

  const lastSyncText = driveLastSync ? formatDateTime(driveLastSync) : "Noch keine Synchronisierung";
  const canShowDriveActions = driveIsConnected;

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
        <h3>Google&nbsp;Drive Synchronisierung</h3>
        <p>
          Verbinde Logorama mit Google Drive und sichere deine Einträge als JSON im App-Data-Folder.
          Du kannst den aktuellen Stand jederzeit manuell hochladen oder den Cloud-Stand zurückholen.
        </p>
        <p>
          <strong>Status:</strong> {driveStatusText}
        </p>
        <p>
          <strong>Letzte Synchronisierung:</strong> {lastSyncText}
        </p>
        {driveError ? <p className="drive-sync__error">{driveError}</p> : null}
        {!canShowDriveActions ? (
          <button
            type="button"
            className="secondary"
            onClick={handleDriveConnect}
            disabled={driveIsBusy}
          >
            Mit Google verbinden
          </button>
        ) : (
          <div className="drive-sync__actions">
            <button
              type="button"
              className="secondary"
              onClick={handleDrivePull}
              disabled={driveIsBusy}
            >
              Aus Google Drive laden
            </button>
            <button
              type="button"
              className="ghost"
              onClick={handleDrivePush}
              disabled={driveIsBusy}
            >
              Jetzt synchronisieren
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(DataSafetyPanel);

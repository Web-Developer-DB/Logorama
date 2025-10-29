import { useCallback } from "react";
import DataSafetyPanel from "../DataSafetyPanel.jsx";
import { useGoogleDriveSync } from "../../hooks/useGoogleDriveSync.js";

/**
 * Präsentationsseite für Backups & Synchronisierung. Die JSON- und Drive-Aktionen
 * werden aus der App durchgereicht, damit sich die Seite auf das UI konzentriert.
 */
const BUSY_STATES = new Set(["connecting", "loading", "saving"]);

const BackupPage = ({
  entries,
  setEntries,
  getEntriesForExport,
  onExport,
  onImportFile,
  disableExport,
  driveSync: driveSyncOverride
}) => {
  const clientId =
    (typeof window !== "undefined" && window.__LOGORAMA_GOOGLE_CLIENT_ID__) ||
    (typeof process !== "undefined" ? process.env?.VITE_GOOGLE_CLIENT_ID : null) ||
    null;

  // Liefert den vollständigen Datenstand für Drive-Uploads.
  const resolveLocalData = useCallback(() => {
    if (typeof getEntriesForExport === "function") {
      return getEntriesForExport();
    }
    return entries;
  }, [entries, getEntriesForExport]);

  // Ersetzt lokale Daten nach erfolgreichem Drive-Pull.
  const applyRemoteData = useCallback(
    (payload) => {
      if (typeof setEntries === "function") {
        setEntries(payload);
      }
    },
    [setEntries]
  );

  const driveSync =
    driveSyncOverride ||
    useGoogleDriveSync({
      clientId,
      getLocalData: resolveLocalData,
      applyRemoteData
    });

  const { status, error, isConnected, lastSync, connect, pull, push } = driveSync;

  const isBusy = BUSY_STATES.has(status);

  return (
    <DataSafetyPanel
      onExport={onExport}
      onImportFile={onImportFile}
      disableExport={disableExport}
      driveStatus={status}
      driveError={error}
      driveLastSync={lastSync}
      driveIsConnected={isConnected}
      driveIsBusy={isBusy}
      onDriveConnect={connect}
      onDrivePull={pull}
      onDrivePush={push}
    />
  );
};

export default BackupPage;

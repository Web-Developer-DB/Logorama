import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DRIVE_SYNC_PREF_KEY = "logorama-drive-sync-enabled";
const DRIVE_SYNC_LAST_KEY = "logorama-drive-last-sync";
const BACKUP_FILE_NAME = "logorama-backup.json";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

const STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  SYNCING: "syncing",
  ERROR: "error"
};

let gapiScriptPromise = null;
let gapiClientPromise = null;

/**
 * Lädt das Google API Script dynamisch und stellt sicher, dass nur eine
 * ausstehende Promise existiert.
 */
const loadGapiScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google APIs sind im aktuellen Kontext nicht verfügbar."));
  }
  if (window.gapi) {
    return Promise.resolve(window.gapi);
  }
  if (gapiScriptPromise) {
    return gapiScriptPromise;
  }
  gapiScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.gapi);
    script.onerror = () => {
      gapiScriptPromise = null;
      reject(new Error("Google API Script konnte nicht geladen werden."));
    };
    document.body.appendChild(script);
  });
  return gapiScriptPromise;
};

/**
 * Initialisiert den Google API Client einschließlich Auth2 Modul.
 */
const initGapiClient = async (clientId, apiKey) => {
  try {
    if (gapiClientPromise) {
      return gapiClientPromise;
    }
    gapiClientPromise = loadGapiScript()
      .then(
        (gapi) =>
          new Promise((resolve, reject) => {
            gapi.load("client:auth2", {
              callback: async () => {
                try {
                  await gapi.client.init({
                    apiKey,
                    clientId,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES
                  });
                  resolve(gapi);
                } catch (error) {
                  reject(error);
                }
              },
              onerror: () => {
                reject(new Error("Google API Client konnte nicht initialisiert werden."));
              }
            });
          })
      )
      .catch((error) => {
        gapiClientPromise = null;
        throw error;
      });
    return gapiClientPromise;
  } catch (error) {
    gapiClientPromise = null;
    throw error;
  }
};

/**
 * Hilfsfunktion, die den Payload einer Drive-Response extrahiert.
 */
const parseDriveResponseBody = (response) => {
  if (!response) return null;
  if (typeof response.body === "string") {
    try {
      return JSON.parse(response.body);
    } catch (error) {
      console.error("Drive-Response konnte nicht geparst werden:", error);
      return null;
    }
  }
  if (response.result && typeof response.result === "object") {
    return response.result;
  }
  return null;
};

/**
 * Liest boolesche Flags konsistent aus dem LocalStorage.
 */
const readBooleanFromStorage = (key, fallback = false) => {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return fallback;
};

/**
 * Liest Strings aus dem LocalStorage oder liefert null.
 */
const readStringFromStorage = (key) => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  return raw ?? null;
};

/**
 * Schreibt Werte in den LocalStorage bzw. löscht den Key bei null.
 */
const writeStorage = (key, value) => {
  if (typeof window === "undefined") return;
  if (value === null || typeof value === "undefined") {
    window.localStorage.removeItem(key);
  } else {
    window.localStorage.setItem(key, value);
  }
};

/**
 * Validiert, ob alle benötigten ENV-Variablen vorhanden sind.
 */
const ensureEnv = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!clientId) {
    throw new Error(
      "Google Drive Sync ist nicht konfiguriert. Bitte VITE_GOOGLE_CLIENT_ID setzen."
    );
  }
  if (!apiKey) {
    throw new Error("Google Drive Sync ist nicht konfiguriert. Bitte VITE_GOOGLE_API_KEY setzen.");
  }
  return { clientId, apiKey };
};

/**
 * Gibt die erste gefundene Datei aus einer Drive-Liste zurück.
 */
const pluckDriveFile = (response) => {
  const files = response?.result?.files;
  if (Array.isArray(files) && files.length) {
    return files[0];
  }
  return null;
};

const initialEnabled = readBooleanFromStorage(DRIVE_SYNC_PREF_KEY, false);

/**
 * Zentrale Schnittstelle für die Google-Drive-Synchronisierung.
 * Verwaltet Authentifizierung, Dateiverwaltung und Statusmeldungen.
 */
const useGoogleDriveSync = ({ entries, onImportEntries }) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [status, setStatus] = useState(initialEnabled ? STATUS.CONNECTING : STATUS.IDLE);
  const [lastSync, setLastSync] = useState(() => readStringFromStorage(DRIVE_SYNC_LAST_KEY));
  const [error, setError] = useState(null);
  const [remoteModifiedTime, setRemoteModifiedTime] = useState(null);
  const entriesRef = useRef(entries);
  const fileIdRef = useRef(null);
  const syncTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isSignedInRef = useRef(false);

  /**
   * Bewahrt stets den aktuellen Eintragsbestand in einer Ref auf,
   * damit Hintergrundjobs konsistente Daten verwenden.
   */
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  /**
   * Persistiert die Nutzerpräferenz (Sync an/aus).
   */
  useEffect(() => {
    writeStorage(DRIVE_SYNC_PREF_KEY, enabled ? "true" : "false");
  }, [enabled]);

  /**
   * Speichert Zeitstempel der letzten erfolgreichen Synchronisierung.
   */
  useEffect(() => {
    if (!lastSync) {
      writeStorage(DRIVE_SYNC_LAST_KEY, null);
    } else {
      writeStorage(DRIVE_SYNC_LAST_KEY, lastSync);
    }
  }, [lastSync]);

  /**
   * Aufräumen bei Unmount: laufende Timer stoppen und Mount-Flag setzen.
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  /**
   * Stellt sicher, dass der Google-Client initialisiert und der Benutzer eingeloggt ist.
   */
  const ensureClient = useCallback(async () => {
    const { clientId, apiKey } = ensureEnv();
    const gapi = await initGapiClient(clientId, apiKey);
    const auth = gapi.auth2.getAuthInstance();
    if (!auth) {
      throw new Error("Google Auth konnte nicht initialisiert werden.");
    }
    if (!auth.isSignedIn.get()) {
      await auth.signIn();
    }
    isSignedInRef.current = true;
    return gapi;
  }, []);

  /**
   * Sucht nach der bestehenden Backup-Datei im AppData-Ordner von Drive.
   */
  const locateBackupFile = useCallback(async (gapi) => {
    if (fileIdRef.current) {
      return { id: fileIdRef.current };
    }
    const response = await gapi.client.drive.files.list({
      spaces: "appDataFolder",
      fields: "files(id, name, modifiedTime)",
      pageSize: 1,
      q: `name = '${BACKUP_FILE_NAME}' and trashed = false`
    });
    const file = pluckDriveFile(response);
    if (file) {
      fileIdRef.current = file.id;
      if (file.modifiedTime) {
        setRemoteModifiedTime(file.modifiedTime);
      }
    }
    return file;
  }, []);

  /**
   * Legt eine neue Backup-Datei an, falls noch keine existiert.
   */
  const createBackupFile = useCallback(async (gapi, payload) => {
    const response = await gapi.client.drive.files.create({
      resource: {
        name: BACKUP_FILE_NAME,
        parents: ["appDataFolder"]
      },
      media: {
        mimeType: "application/json",
        body: JSON.stringify(payload, null, 2)
      },
      fields: "id, modifiedTime"
    });
    const file = response.result;
    if (file?.id) {
      fileIdRef.current = file.id;
    }
    if (file?.modifiedTime) {
      setRemoteModifiedTime(file.modifiedTime);
    }
    return file;
  }, []);

  /**
   * Schreibt den aktuellen Datenstand in die bestehende (oder neue) Datei.
   */
  const pushSnapshot = useCallback(
    async (gapi, payload) => {
      const serialized = JSON.stringify(payload, null, 2);
      const snapshot = { mimeType: "application/json", body: serialized };
      const file = await locateBackupFile(gapi);
      if (file?.id) {
        const updateResponse = await gapi.client.drive.files.update({
          fileId: file.id,
          media: snapshot,
          fields: "id, modifiedTime"
        });
        const updated = updateResponse.result;
        if (updated?.modifiedTime) {
          setRemoteModifiedTime(updated.modifiedTime);
        }
        return updated;
      }
      return createBackupFile(gapi, payload);
    },
    [createBackupFile, locateBackupFile]
  );

  /**
   * Lädt den gespeicherten Snapshot aus Google Drive herunter.
   */
  const fetchSnapshot = useCallback(
    async (gapi) => {
      const file = await locateBackupFile(gapi);
      if (!file?.id) {
        return null;
      }
      const response = await gapi.client.drive.files.get({
        fileId: file.id,
        alt: "media"
      });
      const parsed = parseDriveResponseBody(response);
      if (file.modifiedTime) {
        setRemoteModifiedTime(file.modifiedTime);
      }
      return parsed;
    },
    [locateBackupFile]
  );

  /**
   * Startet eine manuelle oder automatische Synchronisierung und aktualisiert den Status.
   */
  const syncNow = useCallback(async () => {
    if (!enabled) return null;
    try {
      setStatus(STATUS.SYNCING);
      setError(null);
      const gapi = await ensureClient();
      const payload = {
        metadata: {
          syncedAt: new Date().toISOString(),
          entriesCount: entriesRef.current.length
        },
        entries: entriesRef.current
      };
      const result = await pushSnapshot(gapi, payload);
      const syncedAt = payload.metadata.syncedAt;
      if (result?.modifiedTime) {
        setRemoteModifiedTime(result.modifiedTime);
      }
      setLastSync(syncedAt);
      setStatus(STATUS.CONNECTED);
      return syncedAt;
    } catch (err) {
      console.error("Google Drive Sync fehlgeschlagen:", err);
      setError(err);
      setStatus(STATUS.ERROR);
      if (err?.status === 401) {
        isSignedInRef.current = false;
      }
      throw err;
    }
  }, [enabled, ensureClient, pushSnapshot]);

  /**
   * Lädt Daten aus Drive und speist sie in den lokalen Bestand ein.
   */
  const restoreFromDrive = useCallback(async () => {
    if (!enabled) return;
    try {
      setStatus(STATUS.SYNCING);
      setError(null);
      const gapi = await ensureClient();
      const snapshot = await fetchSnapshot(gapi);
      if (snapshot?.entries && Array.isArray(snapshot.entries) && onImportEntries) {
        onImportEntries(snapshot.entries);
      }
      const syncedAt = snapshot?.metadata?.syncedAt ?? null;
      if (syncedAt) {
        setLastSync(syncedAt);
      }
      setStatus(STATUS.CONNECTED);
      return snapshot;
    } catch (err) {
      console.error("Google Drive Wiederherstellung fehlgeschlagen:", err);
      setError(err);
      setStatus(STATUS.ERROR);
      throw err;
    }
  }, [enabled, ensureClient, fetchSnapshot, onImportEntries]);

  /**
   * Verbindet bei Aktivierung automatisch mit Google Drive und stößt eine erste Sync an.
   */
  useEffect(() => {
    if (!enabled) {
      setStatus(STATUS.IDLE);
      setError(null);
      isSignedInRef.current = false;
      fileIdRef.current = null;
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setStatus(STATUS.CONNECTING);
        setError(null);
        const gapi = await ensureClient();
        if (cancelled) return;
        await locateBackupFile(gapi);
        if (cancelled) return;
        setStatus(STATUS.CONNECTED);
        // Beim ersten Aktivieren sofort synchronisieren.
        await syncNow();
      } catch (err) {
        if (cancelled || !isMountedRef.current) {
          return;
        }
        console.error("Google Drive Verbindung fehlgeschlagen:", err);
        setError(err);
        setStatus(STATUS.ERROR);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, ensureClient, locateBackupFile, syncNow]);

  /**
   * Beobachtet lokale Änderungen und plant in kurzem Abstand eine Hintergrund-Synchronisierung.
   */
  useEffect(() => {
    if (!enabled || !isSignedInRef.current) {
      return;
    }
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = window.setTimeout(() => {
      syncTimerRef.current = null;
      syncNow().catch(() => {
        // Fehler werden bereits im Hook-State behandelt.
      });
    }, 1500);
    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [enabled, entries, syncNow]);

  /**
   * Komfortabler Toggle für das Sync-Flag.
   */
  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const driveStatus = useMemo(() => status, [status]);
  const driveErrorMessage = useMemo(() => {
    if (!error) return null;
    return error.message ?? "Unbekannter Fehler bei der Google Drive Synchronisation.";
  }, [error]);

  return {
    driveSyncEnabled: enabled,
    setDriveSyncEnabled: setEnabled,
    toggleDriveSync: toggleEnabled,
    driveStatus,
    driveLastSync: lastSync,
    driveError: driveErrorMessage,
    syncNow,
    restoreFromDrive,
    STATUS
  };
};

export default useGoogleDriveSync;

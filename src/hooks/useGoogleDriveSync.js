// src/hooks/useGoogleDriveSync.js
import { useCallback, useMemo, useRef, useState } from "react";

const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const FILE_NAME = "app-data.json";
const FILE_ID_KEY = "driveFileId"; // Cache im localStorage

function waitForGoogle() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const t = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(t);
        resolve();
      }
    }, 150);
  });
}

async function getAccessToken({ clientId, prompt = "consent" }) {
  await waitForGoogle();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp?.access_token) resolve(resp.access_token);
        else reject(new Error("Kein Access Token erhalten"));
      },
      error_callback: (err) => reject(err),
    });
    client.requestAccessToken({ prompt });
  });
}

async function driveFetch(url, token, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const e = new Error("UNAUTHORIZED");
    e.code = 401;
    throw e;
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Drive ${res.status} ${res.statusText}: ${txt}`);
  }
  return res;
}

async function findAppDataFileId(token) {
  const q = encodeURIComponent(`name='${FILE_NAME}' and 'appDataFolder' in parents`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=appDataFolder&fields=files(id,name)`;
  const res = await driveFetch(url, token);
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

async function createJsonInAppData(token, initial) {
  const metadata = { name: FILE_NAME, parents: ["appDataFolder"], mimeType: "application/json" };
  const boundary = "----logorama-drive-sync";
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) + `\r\n` +
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(initial || {}) + `\r\n` +
    `--${boundary}--`;

  const res = await driveFetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    token,
    { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body }
  );
  const json = await res.json();
  return json.id;
}

async function downloadJson(token, fileId) {
  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, token);
  return await res.json();
}

async function uploadJson(token, fileId, data) {
  await driveFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    token,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data || {}) }
  );
}

export function useGoogleDriveSync({ clientId, getLocalData, applyRemoteData }) {
  const [status, setStatus] = useState("idle"); // idle|connecting|connected|loading|saving|error
  const [token, setToken] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [error, setError] = useState(null);
  const lastSyncRef = useRef(null);

  const setErrorState = useCallback((e) => {
    setStatus("error");
    setError(e?.message || String(e));
  }, []);

  const ensureAuth = useCallback(
    async (silent) => {
      if (!clientId) {
        const err = new Error("VITE_GOOGLE_CLIENT_ID ist nicht gesetzt.");
        setErrorState(err);
        throw err;
      }
      try {
        const t = await getAccessToken({ clientId, prompt: silent ? "" : "consent" });
        setToken(t);
        return t;
      } catch (e) {
        setErrorState(e);
        throw e;
      }
    },
    [clientId, setErrorState]
  );

  const ensureFileId = useCallback(async (tkn) => {
    let id = localStorage.getItem(FILE_ID_KEY);
    if (id) return id;
    const found = await findAppDataFileId(tkn);
    if (found) {
      localStorage.setItem(FILE_ID_KEY, found);
      return found;
    }
    const created = await createJsonInAppData(tkn, {});
    localStorage.setItem(FILE_ID_KEY, created);
    return created;
  }, []);

  const withAuth = useCallback(
    async (run, baseToken) => {
      let activeToken = baseToken ?? token;
      if (!activeToken) {
        activeToken = await ensureAuth(true);
      }
      try {
        return await run(activeToken);
      } catch (e) {
        if (e?.code === 401) {
          try {
            const refreshed = await ensureAuth(true);
            return await run(refreshed);
          } catch (retryError) {
            setErrorState(retryError);
            throw retryError;
          }
        }
        setErrorState(e);
        throw e;
      }
    },
    [ensureAuth, setErrorState, token]
  );

  const connect = useCallback(async () => {
    setError(null);
    setStatus("connecting");
    try {
      await ensureAuth(false);
      setStatus("connected");
    } catch (e) {
      // ensureAuth handled error state already
      console.error("Verbindung zu Google Drive fehlgeschlagen:", e);
    }
  }, [ensureAuth]);

  const pull = useCallback(async () => {
    setError(null);
    setStatus("loading");
    try {
      const { activeToken, id } = await withAuth(async (currentToken) => {
        const resolvedId = fileId || (await ensureFileId(currentToken));
        setFileId(resolvedId);
        return { activeToken: currentToken, id: resolvedId };
      });
      const remote = await withAuth(
        async (currentToken) => downloadJson(currentToken, id),
        activeToken
      );
      applyRemoteData?.(remote);
      setStatus("connected");
      lastSyncRef.current = new Date().toISOString();
    } catch (e) {
      console.error("Pull aus Google Drive fehlgeschlagen:", e);
      // setErrorState already called in withAuth / ensureAuth
    }
  }, [applyRemoteData, ensureFileId, fileId, withAuth]);

  const push = useCallback(async () => {
    setError(null);
    setStatus("saving");
    try {
      const { activeToken, id } = await withAuth(async (currentToken) => {
        const resolvedId = fileId || (await ensureFileId(currentToken));
        setFileId(resolvedId);
        return { activeToken: currentToken, id: resolvedId };
      });
      const data = await Promise.resolve(getLocalData?.());
      await withAuth(
        async (currentToken) => uploadJson(currentToken, id, data),
        activeToken
      );
      setStatus("connected");
      lastSyncRef.current = new Date().toISOString();
    } catch (e) {
      console.error("Push nach Google Drive fehlgeschlagen:", e);
      // setErrorState already handled
    }
  }, [ensureFileId, fileId, getLocalData, withAuth]);

  const lastSync = useMemo(() => lastSyncRef.current, [status]);

  return { status, error, isConnected: status === "connected", lastSync, connect, pull, push };
}

/**
 * @fileoverview
 * Sammlung von Helper-Funktionen rund um Einträge und Papierkorb.
 * Dieses Modul kapselt Formatierungen, LocalStorage-Ladevorgänge und
 * Normalisierungsschritte, damit andere Teile der App nicht mehr selbst
 * mit Rohdaten hantieren müssen.
 */

const WEEKDAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag"
];

export const DEFAULT_TITLE_SEPARATOR = " - ";
export const STORAGE_KEY = "personal-log-entries";
export const TRASH_STORAGE_KEY = "personal-log-trash";
export const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Erzeugt eine stabile ID für neue Einträge.
 * Bevorzugt UUIDs, fällt bei älteren Browsern auf einen mix aus Timestamp
 * und Zufallsanteil zurück, damit keine Kollisionen auftreten.
 */
export const generateId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `entry-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const formatTwoDigits = (value) => value.toString().padStart(2, "0");

const toTimestamp = (isoString) => {
  const time = new Date(isoString).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getLocalDateDetails = (isoString) => {
  if (!isoString) {
    return { key: "", weekday: "" };
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return { key: "", weekday: "" };
  }
  const year = date.getFullYear();
  const month = formatTwoDigits(date.getMonth() + 1);
  const day = formatTwoDigits(date.getDate());
  const weekday = WEEKDAY_NAMES[date.getDay()] ?? "";
  return {
    key: `${year}-${month}-${day}`,
    weekday
  };
};

/**
 * Vergibt konsistente Auto-Titel für Einträge ohne eigenen Titel.
 * Die Nummerierung startet für jeden Kalendertag bei 1 und nutzt den
 * ausgeschriebenen Wochentag als Suffix.
 */
export const reindexAutoTitles = (entriesList) => {
  if (!Array.isArray(entriesList) || !entriesList.length) {
    return entriesList;
  }

  const cloned = entriesList.map((entry) => ({ ...entry }));
  const sorted = cloned
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => toTimestamp(a.entry.createdAt) - toTimestamp(b.entry.createdAt));

  const counters = new Map();
  let hasChanges = false;

  sorted.forEach(({ entry, index }) => {
    const { key, weekday } = getLocalDateDetails(entry.createdAt);
    if (!key || !weekday) {
      if (entry.isAutoTitle) {
        cloned[index].isAutoTitle = false;
        hasChanges = true;
      }
      return;
    }

    const count = (counters.get(key) ?? 0) + 1;
    counters.set(key, count);

    const currentTitle = typeof entry.title === "string" ? entry.title.trim() : "";
    const shouldAuto = entry.isAutoTitle || !currentTitle;

    if (shouldAuto) {
      const generatedTitle = `${count}${DEFAULT_TITLE_SEPARATOR}${weekday}`;
      if (cloned[index].title !== generatedTitle) {
        cloned[index].title = generatedTitle;
        hasChanges = true;
      }
      if (!cloned[index].isAutoTitle) {
        cloned[index].isAutoTitle = true;
        hasChanges = true;
      }
    } else if (entry.isAutoTitle) {
      cloned[index].isAutoTitle = false;
      hasChanges = true;
    }
  });

  return hasChanges ? cloned : entriesList;
};

/**
 * Prüft, ob ein Papierkorb-Eintrag älter als die Aufbewahrungsfrist ist
 * und bei der nächsten Synchronisierung entfernt werden sollte.
 */
export const isTrashEntryExpired = (entry, referenceTime = Date.now()) => {
  if (!entry?.deletedAt) {
    return false;
  }
  const deletedAtMs = new Date(entry.deletedAt).getTime();
  if (Number.isNaN(deletedAtMs)) {
    return false;
  }
  return referenceTime - deletedAtMs > TRASH_RETENTION_MS;
};

/**
 * Normalisiert einen Datensatz aus dem LocalStorage oder einem Import.
 * Es werden fehlende Felder ergänzt und inkonsistente Werte korrigiert.
 */
export const normalizeEntry = (entry) => {
  const normalizedTitle = typeof entry.title === "string" ? entry.title : "";
  const hasManualTitle = normalizedTitle.trim().length > 0;
  const createdAt = entry.createdAt ?? new Date().toISOString();
  return {
    id: entry.id ?? generateId(),
    title: normalizedTitle,
    content: entry.content ?? "",
    createdAt,
    editedAt: entry.editedAt ?? createdAt,
    isAutoTitle: entry.isAutoTitle ?? !hasManualTitle
  };
};

/**
 * Lädt alle aktiven Einträge aus dem LocalStorage und gibt sie
 * in normalisierter Form zurück. Fehler führen zu einer leeren Liste,
 * damit die App weiterläuft.
 */
export const loadEntries = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEntry);
  } catch (error) {
    console.error("Konnte gespeicherte Logs nicht laden:", error);
    return [];
  }
};

/**
 * Wandelt einen Papierkorb-Datensatz um und stellt sicher, dass zusätzlich
 * ein `deletedAt`-Zeitstempel existiert, damit Aufräumjobs korrekt greifen.
 */
export const normalizeTrashEntry = (entry) => {
  const normalized = normalizeEntry(entry);
  return {
    ...normalized,
    deletedAt: entry.deletedAt ?? new Date().toISOString()
  };
};

/**
 * Hydriert den Papierkorb aus dem LocalStorage, normalisiert die Einträge
 * und filtert veraltete Elemente heraus.
 */
export const loadTrashEntries = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(TRASH_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed
      .map(normalizeTrashEntry)
      .filter((entry) => !isTrashEntryExpired(entry, now));
  } catch (error) {
    console.error("Konnte Papierkorb nicht laden:", error);
    return [];
  }
};

/**
 * Überführt einen kompletten Backup-Payload zurück in den App-Zustand.
 * Nicht-arrayförmige Eingaben lösen eine Exception aus, damit der Aufrufer
 * die Nutzer:innen informieren kann.
 */
export const normalizeEntriesPayload = (payload) => {
  if (!Array.isArray(payload)) {
    throw new Error("Ungültiges Format: Erwartet ein Array von Einträgen.");
  }
  return payload.map(normalizeEntry);
};

/**
 * Ermittelt, ob ein Eintrag innerhalb des aktuell gewählten Zeitfilters liegt.
 */
export const filterByRange = (entry, filter) => {
  if (filter === "today") {
    const today = new Date().toISOString().slice(0, 10);
    return entry.createdAt.slice(0, 10) === today;
  }
  if (filter === "week") {
    const now = new Date();
    const created = new Date(entry.createdAt);
    const diff = now - created;
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }
  return true;
};

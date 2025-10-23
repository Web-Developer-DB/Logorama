import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import EntryForm from "./components/EntryForm.jsx";
import SearchFilter from "./components/SearchFilter.jsx";
import ActiveEntriesSection from "./components/ActiveEntriesSection.jsx";
import TrashSection from "./components/TrashSection.jsx";
import DataSafetyPanel from "./components/DataSafetyPanel.jsx";
import { formatDateTime } from "./utils/formatters.js";

// Primary localStorage buckets: active Einträge + Papierkorb.
const STORAGE_KEY = "personal-log-entries";
const TRASH_STORAGE_KEY = "personal-log-trash";
// Gelöschte Einträge werden nach 30 Tagen bereinigt.
const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const WEEKDAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag"
];
const DEFAULT_TITLE_SEPARATOR = " - ";

/**
 * Prüft, ob ein Papierkorb-Eintrag älter als die Aufbewahrungsfrist ist.
 * Wird sowohl beim Laden als auch zyklisch zur Selbstreinigung genutzt.
 */
const isTrashEntryExpired = (entry, referenceTime = Date.now()) => {
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
 * Erzeugt eine konsistente ID – bevorzugt `crypto.randomUUID`, fallback auf Timestamp.
 */
const generateId = () => {
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
 * Vergibt laufende Wochentagstitel für alle Einträge mit Auto-Titel-Flag
 * bzw. ohne manuell gesetzten Titel. Nummerierung erfolgt pro Kalendertag.
 */
const reindexAutoTitles = (entriesList) => {
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
 * Vorbefüllung des Formulars mit der aktuellen lokalen Zeit (auf Minuten gerundet).
 */
const getInitialDateTime = () => {
  const now = new Date();
  now.setSeconds(0, 0);

  const year = now.getFullYear();
  const month = formatTwoDigits(now.getMonth() + 1);
  const day = formatTwoDigits(now.getDate());
  const hours = formatTwoDigits(now.getHours());
  const minutes = formatTwoDigits(now.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Lädt aktive Einträge aus localStorage und normalisiert fehlende Felder.
 */
const loadEntries = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => {
      const normalizedTitle = typeof entry.title === "string" ? entry.title : "";
      const hasManualTitle = normalizedTitle.trim().length > 0;
      return {
        id: entry.id ?? generateId(),
        title: normalizedTitle,
        content: entry.content ?? "",
        createdAt: entry.createdAt ?? new Date().toISOString(),
        editedAt: entry.editedAt ?? entry.createdAt ?? new Date().toISOString(),
        isAutoTitle: entry.isAutoTitle ?? !hasManualTitle
      };
    });
  } catch (error) {
    console.error("Konnte gespeicherte Logs nicht laden:", error);
    return [];
  }
};

/**
 * Lädt Papierkorb aus localStorage, normalisiert Daten und entfernt abgelaufene Einträge.
 */
const loadTrashEntries = () => {
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
      .map((entry) => {
        const normalizedTitle = typeof entry.title === "string" ? entry.title : "";
        const hasManualTitle = normalizedTitle.trim().length > 0;
        return {
          id: entry.id ?? generateId(),
          title: normalizedTitle,
          content: entry.content ?? "",
          createdAt: entry.createdAt ?? new Date().toISOString(),
          editedAt: entry.editedAt ?? entry.createdAt ?? new Date().toISOString(),
          deletedAt: entry.deletedAt ?? new Date().toISOString(),
          isAutoTitle: entry.isAutoTitle ?? !hasManualTitle
        };
      })
      .filter((entry) => !isTrashEntryExpired(entry, now));
  } catch (error) {
    console.error("Konnte Papierkorb nicht laden:", error);
    return [];
  }
};

const filterByRange = (entry, filter) => {
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

/**
 * Root-Komponente der Anwendung: orchestriert State, Persistenz und verteilt Daten
 * an die kleineren Präsentations- und Formular-Komponenten.
 */
const App = () => {
  // PWA: speichert das beforeinstallprompt-Event, um einen Install-Button zu zeigen.
  const [installPrompt, setInstallPrompt] = useState(null);
  // Aktive Einträge + Papierkorb werden aus localStorage hydriert.
  const [entries, setEntries] = useState(() => reindexAutoTitles(loadEntries()));
  const [trashEntries, setTrashEntries] = useState(loadTrashEntries);
  // Globale Suchleiste filtert Titel + Inhalte.
  const [search, setSearch] = useState("");
  // Formulardaten für den Editor.
  const [formState, setFormState] = useState({
    date: getInitialDateTime(),
    title: "",
    content: ""
  });
  // Filter für Zeitbereiche (Alle / Heute / Letzte 7 Tage).
  const [filter, setFilter] = useState("all");

  const updateEntries = useCallback((updater) => {
    setEntries((prev) => {
      const nextEntries = typeof updater === "function" ? updater(prev) : updater;
      if (!Array.isArray(nextEntries)) {
        return prev;
      }
      return reindexAutoTitles(nextEntries);
    });
  }, []);

  // Persistiert aktive Einträge nach jeder Änderung.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  /**
   * Persistiert den Papierkorb und entfernt dabei abgelaufene Einträge.
   * Sollte sich während des Filters etwas geändert haben, wird der State
   * aktualisiert, bevor ein Persist erfolgt, damit keine veralteten Daten landen.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const now = Date.now();
    const filtered = trashEntries.filter((entry) => !isTrashEntryExpired(entry, now));
    if (filtered.length !== trashEntries.length) {
      setTrashEntries(filtered);
      return;
    }
    window.localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trashEntries));
  }, [trashEntries]);

  /**
   * Stündlicher Garbage-Collector für den Papierkorb. Dadurch werden alte
   * Einträge auch ohne Nutzerinteraktion gelöscht.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const intervalId = window.setInterval(() => {
      setTrashEntries((prev) => {
        const now = Date.now();
        const filtered = prev.filter((entry) => !isTrashEntryExpired(entry, now));
        return filtered.length === prev.length ? prev : filtered;
      });
    }, 60 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Liest die Hash-Navigation (#new-entry, #filter=...) und setzt internen Filter.
    const applyHash = (shouldScroll = false) => {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("filter=")) {
        const value = hash.split("=")[1];
        if (["all", "today", "week"].includes(value)) {
          setFilter(value);
        }
      } else if (hash === "new-entry" && shouldScroll) {
        document.getElementById("new-entry")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    applyHash(true);

    const listener = () => applyHash(true);
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hält URL-Hash und UI-Filter synchron, ohne Browser-Historie zu fluten.
    const { history, location } = window;
    const currentHash = location.hash.replace("#", "");
    if (filter === "all") {
      if (currentHash.startsWith("filter=")) {
        history.replaceState(null, "", `${location.pathname}${location.search}`);
      }
    } else {
      const nextHash = `filter=${filter}`;
      if (currentHash !== nextHash) {
        history.replaceState(
          null,
          "",
          `${location.pathname}${location.search}#${nextHash}`
        );
      }
    }
  }, [filter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const deferredSearch = useDeferredValue(search);

  const filteredEntries = useMemo(() => {
    const term = (deferredSearch ?? "").trim().toLowerCase();
    return [...entries]
      .filter((entry) => filterByRange(entry, filter))
      .filter((entry) => {
        if (!term) return true;
        return (
          entry.title.toLowerCase().includes(term) ||
          entry.content.toLowerCase().includes(term)
        );
      })
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [entries, deferredSearch, filter]);

  /**
   * Papierkorb wird separat nach Löschdatum sortiert dargestellt.
   */
  const sortedTrashEntries = useMemo(() => {
    const copy = [...trashEntries];
    return copy.sort((a, b) => {
      const aTime = new Date(a.deletedAt ?? 0).getTime();
      const bTime = new Date(b.deletedAt ?? 0).getTime();
      return bTime - aTime;
    });
  }, [trashEntries]);
  const trashEntryCount = sortedTrashEntries.length;

  const handleAppInstall = useCallback(async () => {
    if (!installPrompt) {
      return;
    }
    const promptEvent = installPrompt;
    promptEvent.prompt();
    try {
      await promptEvent.userChoice;
    } catch (error) {
      console.error("App-Installation konnte nicht abgeschlossen werden:", error);
    } finally {
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  // Synchronisiert Formularfelder.
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Legt neuen Eintrag an und setzt Formular zurück.
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    const trimmedContent = formState.content.trim();
    if (!trimmedContent || !formState.date) {
      return;
    }

    const trimmedTitle = formState.title.trim();
    const createdAt = new Date(formState.date).toISOString();
    const newEntry = {
      id: generateId(),
      title: trimmedTitle,
      content: trimmedContent,
      createdAt,
      editedAt: createdAt,
      isAutoTitle: !trimmedTitle
    };

    updateEntries((prev) => [...prev, newEntry]);
    setFormState({
      date: getInitialDateTime(),
      title: "",
      content: ""
    });
    // Nach dem Speichern wieder auf "Alle" schalten, damit neuer Eintrag sichtbar bleibt.
    setFilter("all");
  }, [formState, updateEntries]);

  /**
   * Verschiebt einen Eintrag in den Papierkorb. Falls es bereits eine ältere
   * Version im Papierkorb mit identischer ID gibt (z. B. durch Re-Import),
   * wird diese überschrieben statt dupliziert.
   */
  const handleDelete = useCallback(
    (id) => {
      let entryToDelete = null;
      updateEntries((prev) => {
        const nextEntries = [];
        for (const entry of prev) {
          if (entry.id === id) {
            entryToDelete = entry;
            continue;
          }
          nextEntries.push(entry);
        }
        return nextEntries;
      });
      if (entryToDelete) {
        const deletedAt = new Date().toISOString();
        setTrashEntries((prev) => [
          ...prev.filter((entry) => entry.id !== id),
          { ...entryToDelete, deletedAt }
        ]);
      }
    },
    [updateEntries]
  );

  /**
   * Aktualisiert einen bestehenden Eintrag und stempelt das Bearbeitungsdatum neu.
   */
  const handleUpdate = useCallback(
    (id, updates) => {
      updateEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) {
            return entry;
          }
          const nextEntry = {
            ...entry,
            editedAt: new Date().toISOString()
          };

          if ("content" in updates && typeof updates.content === "string") {
            nextEntry.content = updates.content;
          }

          if ("title" in updates) {
            const normalizedTitle = (updates.title ?? "").trim();
            nextEntry.title = normalizedTitle;
            nextEntry.isAutoTitle = !normalizedTitle;
          }

          return nextEntry;
        })
      );
    },
    [updateEntries]
  );

  /**
   * Stellt einen Eintrag aus dem Papierkorb wieder her und entfernt den Löschstempel.
   */
  const handleRestore = useCallback(
    (id) => {
      let restoredEntry = null;
      setTrashEntries((prev) => {
        const next = [];
        for (const entry of prev) {
          if (entry.id === id) {
            const { deletedAt, ...rest } = entry;
            restoredEntry = rest;
            continue;
          }
          next.push(entry);
        }
        return next;
      });
      if (restoredEntry) {
        updateEntries((prev) => [...prev, restoredEntry]);
      }
    },
    [updateEntries]
  );

  /**
   * Entfernt einen Papierkorb-Eintrag endgültig, sobald der zweistufige Button bestätigt wurde.
   */
  const handleDeleteForever = useCallback((id) => {
    setTrashEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const handleEmptyTrash = useCallback(() => {
    if (!trashEntryCount) {
      return;
    }
    if (typeof window !== "undefined") {
      const shouldDelete = window.confirm(
        "Sollen wirklich alle Einträge im Papierkorb endgültig gelöscht werden?"
      );
      if (!shouldDelete) {
        return;
      }
    }
    setTrashEntries([]);
  }, [trashEntryCount]);

  /**
   * Exportiert aktive Einträge als JSON. Nutzt die File System Access API,
   * wenn der Browser sie anbietet, um den gewünschten Zielordner zu wählen.
   * Fällt ansonsten auf den klassischen Download-Link zurück.
   */
  const handleExport = useCallback(async () => {
    if (!entries.length) {
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `logorama-${timestamp}.json`;
    const payload = JSON.stringify(entries, null, 2);

    if (typeof window !== "undefined" && window.showSaveFilePicker) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "JSON",
              accept: { "application/json": [".json"] }
            }
          ]
        });
        const writable = await fileHandle.createWritable();
        await writable.write(payload);
        await writable.close();
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        console.error("Export via File System API fehlgeschlagen:", error);
      }
    }

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [entries]);

  /**
   * Importiert eine JSON-Datei und ersetzt den gesamten aktiven Bestand.
   * Papierkorb bleibt unangetastet, damit Nutzer vorherige Stände zurückholen können.
   */
  const handleImport = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("Ungültiges Format");
      }
      const normalized = parsed.map((entry) => {
        const normalizedTitle = typeof entry.title === "string" ? entry.title : "";
        const hasManualTitle = normalizedTitle.trim().length > 0;
        return {
          id: entry.id ?? generateId(),
          title: normalizedTitle,
          content: entry.content ?? "",
          createdAt: entry.createdAt ?? new Date().toISOString(),
          editedAt: entry.editedAt ?? entry.createdAt ?? new Date().toISOString(),
          isAutoTitle: entry.isAutoTitle ?? !hasManualTitle
        };
      });
      setEntries(reindexAutoTitles(normalized));
      setFilter("all");
    } catch (error) {
      console.error("Import fehlgeschlagen:", error);
      window.alert("Die Datei konnte nicht importiert werden.");
    } finally {
      event.target.value = "";
    }
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  const handleFilterChange = useCallback((value) => {
    setFilter(value);
  }, []);

  return (
    <>
      <main>
        <header className="app-header">
          <h1>Logorama</h1>
          <p>Notiere Gedanken, Ideen und Fortschritte – offline verfügbar.</p>
          {installPrompt && (
            <button
              type="button"
              className="install-button secondary"
              onClick={handleAppInstall}
            >
              App installieren
            </button>
          )}
        </header>

        <div className="layout-grid">
          <section className="card">
            <EntryForm
              formState={formState}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </section>

          <section className="card">
            <SearchFilter
              searchValue={search}
              onSearchChange={handleSearchChange}
              filterValue={filter}
              onFilterChange={handleFilterChange}
            />

            <ActiveEntriesSection
              entries={filteredEntries}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </section>

          <TrashSection
            entries={sortedTrashEntries}
            onRestore={handleRestore}
            onDeleteForever={handleDeleteForever}
            onEmptyTrash={handleEmptyTrash}
            description="Einträge bleiben 30 Tage erhalten, bevor sie automatisch entfernt werden."
            formatDateTime={formatDateTime}
          />
          <DataSafetyPanel
            onExport={handleExport}
            onImportFile={handleImport}
            disableExport={!entries.length}
          />
        </div>
      </main>
      <footer className="app-footer">
        <span>MIT License · Created by Dimitri B</span>
        <br />
        <a
          href="https://github.com/Web-Developer-DB/Logorama"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source Code auf GitHub
        </a>
      </footer>
    </>
  );
};

export default App;

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import EntryForm from "./components/EntryForm.jsx";
import SearchFilter from "./components/SearchFilter.jsx";
import ActiveEntriesSection from "./components/ActiveEntriesSection.jsx";
import TrashSection from "./components/TrashSection.jsx";
import DataSafetyPanel from "./components/DataSafetyPanel.jsx";
import MobileNav from "./components/MobileNav.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
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
const THEME_STORAGE_KEY = "logorama-theme-mode";

const THEME_MODES = ["system", "light", "dark"];

const applyThemeAttribute = (nextTheme) => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = nextTheme;
};

const getSystemTheme = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveTheme = (mode) => {
  if (mode === "light" || mode === "dark") {
    return mode;
  }
  return getSystemTheme();
};

const getInitialThemeMode = () => {
  if (typeof window === "undefined") {
    return "system";
  }
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "system" || storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return "system";
};

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
  const initialThemeMode = getInitialThemeMode();
  const [themeMode, setThemeMode] = useState(initialThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(initialThemeMode));
  // Aktive Einträge + Papierkorb werden aus localStorage hydriert.
  const [entries, setEntries] = useState(() => reindexAutoTitles(loadEntries()));
  const [trashEntries, setTrashEntries] = useState(loadTrashEntries);
  // Globale Suchleiste filtert Titel + Inhalte.
  const [search, setSearch] = useState("");
  // Formulardaten für den Editor.
  const [formState, setFormState] = useState({
    title: "",
    content: ""
  });
  // Filter für Zeitbereiche (Alle / Heute / Letzte 7 Tage).
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();
  const isHelpRoute = location.pathname === "/help";

  useEffect(() => {
    if (themeMode === "system") {
      setResolvedTheme(resolveTheme("system"));
    } else {
      setResolvedTheme(themeMode);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    applyThemeAttribute(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event) => {
      if (themeMode === "system") {
        setResolvedTheme(event.matches ? "dark" : "light");
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [themeMode]);

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

  useEffect(() => {
    if (location.pathname !== "/entries") {
      setFilter("all");
      setSearch("");
    }
  }, [location.pathname]);

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

  const sortedEntriesDesc = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const term = (deferredSearch ?? "").trim().toLowerCase();
    return sortedEntriesDesc
      .filter((entry) => filterByRange(entry, filter))
      .filter((entry) => {
        if (!term) return true;
        return (
          entry.title.toLowerCase().includes(term) ||
          entry.content.toLowerCase().includes(term)
        );
      });
  }, [sortedEntriesDesc, deferredSearch, filter]);

  const latestEntries = useMemo(() => sortedEntriesDesc.slice(0, 3), [sortedEntriesDesc]);

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
  const totalEntries = entries.length;
  const todayCount = useMemo(
    () => entries.filter((entry) => filterByRange(entry, "today")).length,
    [entries]
  );
  const weekCount = useMemo(
    () => entries.filter((entry) => filterByRange(entry, "week")).length,
    [entries]
  );

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
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmedContent = formState.content.trim();
      if (!trimmedContent) {
        return;
      }

      const trimmedTitle = formState.title.trim();
      const createdAt = new Date().toISOString();
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
        title: "",
        content: ""
      });
      // Nach dem Speichern wieder auf "Alle" schalten, damit neuer Eintrag sichtbar bleibt.
      setFilter("all");
      navigate("/entries");
    },
    [formState, navigate, updateEntries]
  );

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

  const cycleThemeMode = useCallback(() => {
    setThemeMode((prev) => {
      const index = THEME_MODES.indexOf(prev);
      const nextIndex = index === -1 ? 0 : (index + 1) % THEME_MODES.length;
      return THEME_MODES[nextIndex];
    });
  }, []);

  const handleShowToday = useCallback(() => {
    setFilter("today");
    navigate("/entries");
  }, [navigate]);

  return (
    <>
      <main className={`app-shell${isHelpRoute ? " app-shell--has-footer" : ""}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={
              <>
                <header className="app-hero">
                  <div className="app-hero__content">
                    <p className="app-hero__eyebrow">Persönliches Lernjournal</p>
                    <h1>Logorama</h1>
                    <p className="app-hero__lead">
                      Arbeite strukturiert an deinen Projekten: Logorama speichert Gedanken,
                      Fortschritte und Ideen offline im Browser und bietet schnelle Filter für deinen
                      Alltag.
                    </p>
                    <div className="app-hero__actions">
                      <Link to="/new" className="primary">
                        Neuantrag erstellen
                      </Link>
                      <button type="button" className="secondary" onClick={handleShowToday}>
                        Heute anzeigen
                      </button>
                      <ThemeToggle
                        mode={themeMode}
                        resolvedTheme={resolvedTheme}
                        onToggle={cycleThemeMode}
                      />
                      {installPrompt ? (
                        <button type="button" className="ghost" onClick={handleAppInstall}>
                          Selbst installieren
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <ul className="app-hero__metrics">
                    <li>
                      <span className="metric-value">{totalEntries}</span>
                      <span className="metric-label">Gesamte Einträge</span>
                    </li>
                    <li>
                      <span className="metric-value">{todayCount}</span>
                      <span className="metric-label">Heute verfasst</span>
                    </li>
                    <li>
                      <span className="metric-value">{weekCount}</span>
                      <span className="metric-label">Diese Woche</span>
                    </li>
                    <li>
                      <span className="metric-value">{trashEntryCount}</span>
                      <span className="metric-label">Im Papierkorb</span>
                    </li>
                  </ul>
                </header>
                <section className="panel">
                  <header className="panel-heading">
                    <h2 className="panel-title">Aktuelle Einträge</h2>
                    <p className="panel-subtitle">
                      Die drei neuesten Anträge auf einen Blick. Für weitere Details wähle den Menüpunkt
                      „Einträge“.
                    </p>
                  </header>
                  <ActiveEntriesSection
                    entries={latestEntries}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                </section>
              </>
            }
          />
          <Route
            path="/entries"
            element={
              <section className="panel">
                <header className="panel-heading">
                  <h2 className="panel-title">Alle Einträge</h2>
                  <p className="panel-subtitle">
                    Filtere nach Zeitraum und Stichwort, um deine Notizen schneller zu finden.
                  </p>
                </header>
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
            }
          />
          <Route
            path="/new"
            element={
              <section className="panel">
                <header className="panel-heading">
                  <h2 className="panel-title">Neuer Eintrag</h2>
                  <p className="panel-subtitle">
                    Halte neue Gedanken, Ideen oder Fortschritte direkt fest.
                  </p>
                </header>
                <EntryForm
                  formState={formState}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                />
              </section>
            }
          />
          <Route
            path="/trash"
            element={
              <TrashSection
                entries={sortedTrashEntries}
                onRestore={handleRestore}
                onDeleteForever={handleDeleteForever}
                onEmptyTrash={handleEmptyTrash}
                formatDateTime={formatDateTime}
              />
            }
          />
          <Route
            path="/backup"
            element={
              <DataSafetyPanel
                onExport={handleExport}
                onImportFile={handleImport}
                disableExport={!entries.length}
              />
            }
          />
          <Route
            path="/help"
            element={
              <section className="panel">
                <header className="panel-heading">
                  <h2 className="panel-title">Hilfe &amp; Einstieg</h2>
                  <p className="panel-subtitle">
                    So nutzt du Logorama – kurzer Überblick über Navigation und Kernfunktionen.
                  </p>
                </header>
                <div className="help-content">
                  <h3>Navigation</h3>
                  <ul>
                    <li><strong>Home:</strong> Dashboard mit Kennzahlen und den drei aktuellsten Einträgen.</li>
                    <li><strong>Neu:</strong> Formular, um einen neuen Eintrag ("Antrag") zu erfassen.</li>
                    <li><strong>Einträge:</strong> Gesamte Liste mit Suche und Filter nach Zeitraum.</li>
                    <li>
                      <strong>Papierkorb:</strong> Gelöschte Einträge zur Wiederherstellung oder endgültigen Löschung.
                      Einträge werden hier automatisch nach 30 Tagen entfernt.
                    </li>
                    <li><strong>Backup:</strong> Exportiere oder importiere deine Daten als JSON-Datei.</li>
                  </ul>
                  <h3>Tipps zum Start</h3>
                  <ul>
                    <li>Nutze den Button „Neuantrag erstellen“, um deine ersten Notizen zu erfassen.</li>
                    <li>Der Filter „Heute anzeigen“ zeigt dir nur die Einträge des aktuellen Tags.</li>
                    <li>Über den Theme-Switch auf der Home-Seite kannst du zwischen System-, Licht- und Dunkelmodus wechseln.</li>
                    <li>Sichere deine Daten regelmäßig über den Menüpunkt „Backup“.</li>
                  </ul>
                  <h3>Lizenz &amp; Komponenten</h3>
                  <p>
                    Logorama steht unter der MIT License. Der komplette Source Code inklusive aller React-Komponenten
                    befindet sich auf GitHub und kann frei eingesehen oder erweitert werden.
                  </p>
                  <ul>
                    <li>
                      <a
                        href="https://github.com/Web-Developer-DB/Logorama"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Source Code auf GitHub
                      </a>
                    </li>
                    <li>Wichtige Module: <code>App.jsx</code>, <code>MobileNav.jsx</code>, <code>ThemeToggle.jsx</code>, <code>ActiveEntriesSection.jsx</code>, <code>TrashSection.jsx</code>, <code>DataSafetyPanel.jsx</code>.</li>
                  </ul>
                </div>
              </section>
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      {isHelpRoute ? (
        <>
          <footer className="app-footer">
            <div className="app-footer__inner">
              <span>MIT License · Created by Dimitri B</span>
              <a
                href="https://github.com/Web-Developer-DB/Logorama"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source Code auf GitHub
              </a>
            </div>
          </footer>
          <div className="app-footer__spacer" />
        </>
      ) : null}
      <MobileNav
        stats={{
          totalEntries,
          todayCount,
          weekCount,
          trashEntryCount
        }}
      />
    </>
  );
};

export default App;

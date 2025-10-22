import { useEffect, useMemo, useRef, useState } from "react";
import EntryCard from "./components/EntryCard.jsx";

// Primary localStorage buckets: active Einträge + Papierkorb.
const STORAGE_KEY = "personal-log-entries";
const TRASH_STORAGE_KEY = "personal-log-trash";
// Gelöschte Einträge werden nach 30 Tagen bereinigt.
const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

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

/**
 * Vorbefüllung des Formulars mit der aktuellen Zeit (auf Minuten gerundet).
 */
const getInitialDateTime = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
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
    return parsed.map((entry) => ({
      id: entry.id ?? generateId(),
      title: entry.title ?? "",
      content: entry.content ?? "",
      createdAt: entry.createdAt ?? new Date().toISOString(),
      editedAt: entry.editedAt ?? entry.createdAt ?? new Date().toISOString()
    }));
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
      .map((entry) => ({
        id: entry.id ?? generateId(),
        title: entry.title ?? "",
        content: entry.content ?? "",
        createdAt: entry.createdAt ?? new Date().toISOString(),
        editedAt: entry.editedAt ?? entry.createdAt ?? new Date().toISOString(),
        deletedAt: entry.deletedAt ?? new Date().toISOString()
      }))
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
 * Einheitliches Datumsformat für UI-Anzeigen (deutsche Locale).
 */
const formatDateTime = (isoString) =>
  new Date(isoString).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  });

const App = () => {
  // Aktive Einträge + Papierkorb werden aus localStorage hydriert.
  const [entries, setEntries] = useState(loadEntries);
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
  const importInputRef = useRef(null);

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

  /**
   * Selektiert aktiv gefilterte Einträge (Suche + Zeitfenster) und sortiert sie absteigend.
   */
  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
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
  }, [entries, search, filter]);

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

  // Synchronisiert Formularfelder.
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Legt neuen Eintrag an und setzt Formular zurück.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formState.content.trim() || !formState.date) {
      return;
    }

    const createdAt = new Date(formState.date).toISOString();
    const newEntry = {
      id: generateId(),
      title: formState.title.trim(),
      content: formState.content.trim(),
      createdAt,
      editedAt: createdAt
    };

    setEntries((prev) => [...prev, newEntry]);
    setFormState({
      date: getInitialDateTime(),
      title: "",
      content: ""
    });
    // Nach dem Speichern wieder auf "Alle" schalten, damit neuer Eintrag sichtbar bleibt.
    setFilter("all");
  };

  /**
   * Verschiebt einen Eintrag in den Papierkorb. Falls es bereits eine ältere
   * Version im Papierkorb mit identischer ID gibt (z. B. durch Re-Import),
   * wird diese überschrieben statt dupliziert.
   */
  const handleDelete = (id) => {
    const entryToDelete = entries.find((entry) => entry.id === id);
    if (!entryToDelete) {
      return;
    }

    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    setTrashEntries((prev) => [
      ...prev.filter((entry) => entry.id !== id),
      { ...entryToDelete, deletedAt: new Date().toISOString() }
    ]);
  };

  /**
   * Stellt einen Eintrag aus dem Papierkorb wieder her und entfernt den Löschstempel.
   */
  const handleRestore = (id) => {
    const entryToRestore = trashEntries.find((entry) => entry.id === id);
    if (!entryToRestore) {
      return;
    }

    const { deletedAt, ...restoredEntry } = entryToRestore;
    setTrashEntries((prev) => prev.filter((entry) => entry.id !== id));
    setEntries((prev) => [...prev, restoredEntry]);
  };

  /**
   * Entfernt einen Papierkorb-Eintrag sofort (z. B. nach Nutzerbestätigung).
   */
  const handleDeleteForever = (id) => {
    setTrashEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  /**
   * Exportiert aktive Einträge als JSON. Nutzt die File System Access API,
   * wenn der Browser sie anbietet, um den gewünschten Zielordner zu wählen.
   * Fällt ansonsten auf den klassischen Download-Link zurück.
   */
  const handleExport = async () => {
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
  };

  /**
   * Importiert eine JSON-Datei und ersetzt den gesamten aktiven Bestand.
   * Papierkorb bleibt unangetastet, damit Nutzer vorherige Stände zurückholen können.
   */
  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("Ungültiges Format");
      }
      const normalized = parsed.map((entry) => ({
        id: entry.id ?? generateId(),
        title: entry.title ?? "",
        content: entry.content ?? "",
        createdAt: entry.createdAt ?? new Date().toISOString(),
        editedAt: entry.editedAt ?? entry.createdAt ?? new Date().toISOString()
      }));
      setEntries(normalized);
      setFilter("all");
    } catch (error) {
      console.error("Import fehlgeschlagen:", error);
      window.alert("Die Datei konnte nicht importiert werden.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <>
      <main>
        <header className="app-header">
          <h1>Logorama</h1>
          <p>Notiere Gedanken, Ideen und Fortschritte – offline verfügbar.</p>
          <div className="chip-group">
            <span className="chip">Offline nutzbar</span>
            <span className="chip">PWA Installierbar</span>
            <span className="chip">JSON Import &amp; Export</span>
          </div>
        </header>

        <div className="layout-grid">
          <section className="card">
            <form className="log-form" onSubmit={handleSubmit} id="new-entry">
              <label>
                Zeitpunkt
                <input
                  type="datetime-local"
                  name="date"
                  value={formState.date}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Titel (optional)
                <input
                  type="text"
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  placeholder="Stichwort oder Thema"
                  maxLength={120}
                />
              </label>

              <label>
                Eintrag
                <textarea
                  name="content"
                  value={formState.content}
                  onChange={handleInputChange}
                  placeholder="Was möchtest du festhalten?"
                  required
                />
              </label>

              <div className="actions">
                <button type="submit" className="primary">
                  Speichern
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={handleExport}
                  disabled={!entries.length}
                >
                  Als JSON exportieren
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => importInputRef.current?.click()}
                >
                  JSON importieren
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  style={{ display: "none" }}
                />
              </div>
            </form>
          </section>

          <section className="card">
            <div className="log-form" style={{ marginBottom: "16px" }}>
              <input
                type="search"
                placeholder="Suche nach Stichworten"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">Alle Einträge</option>
                <option value="today">Heute</option>
                <option value="week">Letzte 7 Tage</option>
              </select>
            </div>

          {filteredEntries.length ? (
            <div className="log-list">
              {filteredEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Noch keine Einträge. Lege mit deinem ersten Log los!</p>
            </div>
          )}
        </section>

        <section className="card trash-card">
          <div className="trash-header">
            <h2>Papierkorb</h2>
            <p>Einträge bleiben 30 Tage erhalten, bevor sie automatisch entfernt werden.</p>
          </div>

          {sortedTrashEntries.length ? (
            <div className="trash-list">
              {sortedTrashEntries.map((entry) => (
                <article key={entry.id} className="log-entry trash-entry">
                  <header>
                    <div className="trash-title-group">
                      <strong>{entry.title || "Ohne Titel"}</strong>
                      <span className="trash-meta">Gelöscht am {formatDateTime(entry.deletedAt)}</span>
                    </div>
                    <time dateTime={entry.createdAt}>
                      Erstellt am {formatDateTime(entry.createdAt)}
                    </time>
                  </header>
                  <p>{entry.content}</p>
                  <footer>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => handleRestore(entry.id)}
                    >
                      Wiederherstellen
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDeleteForever(entry.id)}
                    >
                      Endgültig löschen
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="trash-empty">
              <p>Papierkorb ist leer. Gelöschte Einträge bleiben 30 Tage erhalten.</p>
            </div>
          )}
        </section>
      </div>
    </main>
    <footer className="app-footer">MIT License · Created by Dimitri B</footer>
  </>
  );
};

export default App;

/**
 * @file useEntriesManager.js
 * @description Zentraler State-Container für Einträge, Papierkorb und Formular.
 * Kapselt sämtliche LocalStorage-Zugriffe, Zeitfilter und Export/Import-Flows.
 */

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  filterByRange,
  generateId,
  isTrashEntryExpired,
  loadEntries,
  loadTrashEntries,
  normalizeEntriesPayload,
  reindexAutoTitles,
  STORAGE_KEY,
  TRASH_STORAGE_KEY
} from "../utils/entries.js";

/**
 * @typedef {Object} ManagedEntry
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string} createdAt
 * @property {string} editedAt
 * @property {boolean} isAutoTitle
 */

/**
 * @typedef {ManagedEntry & { deletedAt: string }} TrashManagedEntry
 */

/**
 * Verwaltet alle Zustände und Operationen rund um Einträge, Papierkorb,
 * Formularinhalte sowie Such- und Filterfunktionen.
 * Die Logik war ursprünglich in der Haupt-App gebündelt und wurde in einen
 * dedizierten Hook ausgelagert, damit Komponenten schlanker bleiben.
 *
 * @returns {{
 *  entries: ManagedEntry[],
 *  latestEntries: ManagedEntry[],
 *  filteredEntries: ManagedEntry[],
 *  sortedTrashEntries: TrashManagedEntry[],
 *  trashEntryCount: number,
 *  totalEntries: number,
 *  todayCount: number,
 *  weekCount: number,
 *  formState: { title: string, content: string },
 *  search: string,
 *  filter: string,
 *  handleInputChange: (event: import("react").ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
 *  handleSubmit: (event: import("react").FormEvent<HTMLFormElement>) => boolean,
 *  handleDelete: (id: string) => void,
 *  handleUpdate: (id: string, updates: { title?: string, content?: string }) => void,
 *  handleRestore: (id: string) => void,
 *  handleDeleteForever: (id: string) => void,
 *  handleEmptyTrash: () => void,
 *  handleSearchChange: (value: string) => void,
 *  handleFilterChange: (value: string) => void,
 *  handleExport: () => void,
 *  handleImportFile: (event: import("react").ChangeEvent<HTMLInputElement>) => Promise<void>,
 *  applyImportedEntries: (payload: unknown) => void,
 *  resetQueryState: () => void
 * }} Öffentliche API für Komponenten wie `App`.
 */
const useEntriesManager = () => {
  const [entries, setEntries] = useState(() => reindexAutoTitles(loadEntries()));
  const [trashEntries, setTrashEntries] = useState(loadTrashEntries);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [formState, setFormState] = useState({ title: "", content: "" });

  /**
   * Wendet Updates auf dem Eintragsliste-State an und stellt sicher,
   * dass die automatischen Titel nachgezogen werden.
   */
  const updateEntries = useCallback((updater) => {
    setEntries((prev) => {
      const nextEntries = typeof updater === "function" ? updater(prev) : updater;
      if (!Array.isArray(nextEntries)) {
        return prev;
      }
      return reindexAutoTitles(nextEntries);
    });
  }, []);

  /**
   * Persistiert den aktiven Eintragsbestand nach jeder Änderung.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  /**
   * Hält den Papierkorb im LocalStorage aktuell und entfernt veraltete Einträge.
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
   * Richtet einen stündlichen Bereinigungslauf ein, der alte Papierkorb-Einträge entfernt.
   */
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const intervalId = window.setInterval(() => {
      setTrashEntries((prev) => {
        const now = Date.now();
        const filtered = prev.filter((entry) => !isTrashEntryExpired(entry, now));
        return filtered.length === prev.length ? prev : filtered;
      });
    }, 60 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  /**
   * Übernimmt Formularänderungen, damit Eingaben kontrolliert bleiben.
   */
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Fügt einen neuen Eintrag hinzu, wenn das Formular abgeschickt wird.
   * Gibt ein boolsches Flag zurück, damit Aufrufer Folgelogik (z. B. Navigation)
   * nur bei Erfolg ausführen.
   */
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmedContent = formState.content.trim();
      if (!trimmedContent) {
        return false;
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
      setFormState({ title: "", content: "" });
      setFilter("all");
      return true;
    },
    [formState, updateEntries]
  );

  /**
   * Löscht einen Eintrag aus dem aktiven Bestand und verschiebt ihn in den Papierkorb.
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
   * Aktualisiert einen bestehenden Eintrag (Titel/Inhalt) und setzt den Bearbeitungsstempel neu.
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
   * Stellt einen Papierkorb-Eintrag wieder her und entfernt den Löschstempel.
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
   * Entfernt einen Eintrag endgültig aus dem Papierkorb.
   */
  const handleDeleteForever = useCallback((id) => {
    setTrashEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  /**
   * Leert den Papierkorb komplett, wenn der Nutzer den Dialog bestätigt.
   */
  const handleEmptyTrash = useCallback(() => {
    if (!trashEntries.length) {
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
  }, [trashEntries.length]);

  /**
   * Delegiert das Update für den Suchtext aus der Filter-Komponente.
   */
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  /**
   * Delegiert das Update für den Zeitraumfilter.
   */
  const handleFilterChange = useCallback((value) => {
    setFilter(value);
  }, []);

  /**
   * Ersetzt den kompletten Eintragsbestand durch einen importierten Payload.
   * Wird sowohl für JSON-Uploads als auch für andere wiederhergestellte Backups verwendet.
   */
  const applyImportedEntries = useCallback(
    (payload) => {
      const normalized = normalizeEntriesPayload(payload);
      setEntries(reindexAutoTitles(normalized));
      setFilter("all");
    },
    [setEntries]
  );

  /**
   * Handhabt den JSON-Export und nutzt, wenn verfügbar, die File System Access API,
   * damit Nutzer:innen einen Zielordner wählen können.
   */
  const handleExport = useCallback(() => {
    if (!entries.length) {
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `logorama-${timestamp}.json`;
    const payload = JSON.stringify(entries, null, 2);

    if (typeof window !== "undefined" && window.showSaveFilePicker) {
      (async () => {
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
        } catch (error) {
          if (error?.name === "AbortError") {
            return;
          }
          console.error("Export via File System API fehlgeschlagen:", error);
        }
      })();
      return;
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
   * Importiert eine JSON-Datei über ein <input type="file"> Event.
   */
  const handleImportFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        applyImportedEntries(parsed);
      } catch (error) {
        console.error("Import fehlgeschlagen:", error);
        window.alert("Die Datei konnte nicht importiert werden.");
      } finally {
        event.target.value = "";
      }
    },
    [applyImportedEntries]
  );

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
          entry.title.toLowerCase().includes(term) || entry.content.toLowerCase().includes(term)
        );
      });
  }, [sortedEntriesDesc, deferredSearch, filter]);

  const latestEntries = useMemo(() => {
    const todaysEntries = sortedEntriesDesc.filter((entry) => filterByRange(entry, "today"));
    return todaysEntries.slice(0, 3);
  }, [sortedEntriesDesc]);

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

  /**
   * Setzt Such- und Filterzustand zurück. Wird genutzt, wenn ein Route-Wechsel
   * die Listenansicht verlässt.
   */
  const resetQueryState = useCallback(() => {
    setSearch("");
    setFilter("all");
  }, []);

  return {
    // States & Derivates
    entries,
    latestEntries,
    filteredEntries,
    sortedTrashEntries,
    trashEntryCount,
    totalEntries,
    todayCount,
    weekCount,
    formState,
    search,
    filter,
    // Mutators
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleUpdate,
    handleRestore,
    handleDeleteForever,
    handleEmptyTrash,
    handleSearchChange,
    handleFilterChange,
    handleExport,
    handleImportFile,
    applyImportedEntries,
    resetQueryState
  };
};

export default useEntriesManager;

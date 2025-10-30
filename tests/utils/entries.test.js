/**
 * @file entries.test.js
 * @description Unit-Tests für entries.js – normalisiert Payloads, generiert IDs und prüft
 * Filter-Logiken.
 */

import {
  DEFAULT_TITLE_SEPARATOR,
  generateId,
  isTrashEntryExpired,
  loadEntries,
  loadTrashEntries,
  normalizeEntriesPayload,
  normalizeEntry,
  normalizeTrashEntry,
  reindexAutoTitles,
  filterByRange
} from "../../src/utils/entries.js";

const STORAGE_KEY = "personal-log-entries";
const TRASH_KEY = "personal-log-trash";

describe("entries utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("generateId produziert eindeutige Werte", () => {
    const first = generateId();
    const second = generateId();
    expect(first).not.toEqual(second);
    expect(first).toMatch(/entry-|\w{4}/);
  });

  test("normalizeEntry ergänzt fehlende Felder", () => {
    const normalized = normalizeEntry({ content: "Hallo" });
    expect(normalized.id).toBeDefined();
    expect(normalized.editedAt).toBeDefined();
    expect(normalized.isAutoTitle).toBe(true);
  });

  test("reindexAutoTitles nummeriert Einträge pro Tag", () => {
    const today = new Date().toISOString();
    const entries = [
      { id: "a", title: "", content: "1", createdAt: today, isAutoTitle: true },
      { id: "b", title: "", content: "2", createdAt: today, isAutoTitle: true }
    ];
    const result = reindexAutoTitles(entries);
    expect(result[0].title.startsWith(`1${DEFAULT_TITLE_SEPARATOR}`)).toBe(true);
    expect(result[1].title.startsWith(`2${DEFAULT_TITLE_SEPARATOR}`)).toBe(true);
  });

  test("normalizeEntriesPayload weist ungültige Strukturen ab", () => {
    expect(() => normalizeEntriesPayload({})).toThrow();
    const normalized = normalizeEntriesPayload([
      { id: "1", title: "", content: "Ok" }
    ]);
    expect(normalized).toHaveLength(1);
  });

  test("loadEntries liest normalisierte Daten aus dem LocalStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ content: "Persist" }]));
    const loaded = loadEntries();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].content).toBe("Persist");
  });

  test("Papierkorb-Ladevorgang filtert abgelaufene Elemente", () => {
    const oldTime = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    const fresh = new Date().toISOString();
    localStorage.setItem(
      TRASH_KEY,
      JSON.stringify([
        { id: "old", content: "Alt", deletedAt: oldTime },
        { id: "fresh", content: "Neu", deletedAt: fresh }
      ])
    );
    const loaded = loadTrashEntries();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe("fresh");
  });

  test("normalizeTrashEntry stellt deletedAt sicher", () => {
    const normalized = normalizeTrashEntry({ content: "Papierkorb" });
    expect(normalized.deletedAt).toBeDefined();
  });

  test("isTrashEntryExpired erkennt veraltete Einträge", () => {
    const oldEntry = { deletedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() };
    const freshEntry = { deletedAt: new Date().toISOString() };
    expect(isTrashEntryExpired(oldEntry)).toBe(true);
    expect(isTrashEntryExpired(freshEntry)).toBe(false);
  });

  test("filterByRange berücksichtigt today und week", () => {
    const today = { createdAt: new Date().toISOString() };
    const week = {
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    };
    const old = {
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    };
    expect(filterByRange(today, "today")).toBe(true);
    expect(filterByRange(week, "week")).toBe(true);
    expect(filterByRange(old, "week")).toBe(false);
  });
});

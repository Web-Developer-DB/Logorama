/**
 * @file navItems.test.jsx
 * @description Validiert Badgelogik und Icon-Vergabe der Navigationshilfe.
 */

import { buildNavItems } from "../../src/utils/navItems.jsx";

describe("buildNavItems", () => {
  test("liefert für jede Route ein Icon und optionales Badge", () => {
    const items = buildNavItems({ totalEntries: 5, trashEntryCount: 2 });
    const home = items.find((item) => item.key === "home");
    const entries = items.find((item) => item.key === "entries");
    const trash = items.find((item) => item.key === "trash");

    expect(home.icon).toBeTruthy();
    expect(entries.badge).toBe(5);
    expect(trash.badge).toBe(2);
  });

  test("unterdrückt Badges mit Nullwerten", () => {
    const items = buildNavItems({ totalEntries: 0, trashEntryCount: 0 });
    const entries = items.find((item) => item.key === "entries");
    const trash = items.find((item) => item.key === "trash");
    expect(entries.badge).toBeNull();
    expect(trash.badge).toBeNull();
  });
});

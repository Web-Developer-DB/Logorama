/**
 * @file EntriesPage.test.jsx
 * @description Tests für die Such- und Filterleiste der Eintragsübersicht.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import EntriesPage from "./EntriesPage.jsx";
import { filterByRange } from "../../utils/entries.js";

const baseEntries = [
  {
    id: "today",
    title: "Heute lernen",
    content: "React Hooks und Context",
    createdAt: new Date().toISOString()
  },
  {
    id: "week",
    title: "Wöchentlicher Rückblick",
    content: "Reflexion der letzten Tage",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "old",
    title: "Älterer Log",
    content: "Vor einiger Zeit verfasst",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Rendert die Page mit kontrolliertem State, damit wir Wechsel der Filter simulieren können.
 * Die Funktion spiegelt grob den Hook-Aufbau wider: Filter und Suche leben außerhalb der Komponente
 * und führen bei Veränderung ein erneutes Rendern aus.
 */
const renderEntriesPage = (entries = baseEntries) => {
  let filter = "all";
  let search = "";
  const onDeleteEntry = jest.fn();
  const onUpdateEntry = jest.fn();

  const getFilteredEntries = () => {
    const term = search.trim().toLowerCase();
    return entries
      .filter((entry) => filterByRange(entry, filter))
      .filter((entry) => {
        if (!term) return true;
        return (
          entry.title.toLowerCase().includes(term) || entry.content.toLowerCase().includes(term)
        );
      });
  };

  let rerenderPage;

  const handleSearchChange = (value) => {
    search = value;
    rerenderPage();
  };

  const handleFilterChange = (value) => {
    filter = value;
    rerenderPage();
  };

  const renderResult = render(
    <EntriesPage
      entries={getFilteredEntries()}
      searchValue={search}
      onSearchChange={handleSearchChange}
      filterValue={filter}
      onFilterChange={handleFilterChange}
      onDeleteEntry={onDeleteEntry}
      onUpdateEntry={onUpdateEntry}
    />
  );

  rerenderPage = () => {
    renderResult.rerender(
      <EntriesPage
        entries={getFilteredEntries()}
        searchValue={search}
        onSearchChange={handleSearchChange}
        filterValue={filter}
        onFilterChange={handleFilterChange}
        onDeleteEntry={onDeleteEntry}
        onUpdateEntry={onUpdateEntry}
      />
    );
  };

  return renderResult;
};

describe("EntriesPage", () => {
  test("filtert Einträge nach Zeitraum und Suchbegriff", async () => {
    // Arrange
    const user = userEvent.setup();
    renderEntriesPage();

    // Assert initial state: alle Einträge sichtbar.
    expect(screen.getByText("Älterer Log")).toBeInTheDocument();
    const filterSelect = screen.getByRole("combobox");

    // Act: Filter auf "Heute" setzen.
    await user.selectOptions(filterSelect, "today");
    expect(screen.getByText("Heute lernen")).toBeInTheDocument();
    expect(screen.queryByText("Wöchentlicher Rückblick")).not.toBeInTheDocument();
    expect(screen.queryByText("Älterer Log")).not.toBeInTheDocument();

    // Act: Filter auf "Letzte 7 Tage" ausweiten.
    await user.selectOptions(filterSelect, "week");
    expect(screen.getByText("Heute lernen")).toBeInTheDocument();
    expect(screen.getByText("Wöchentlicher Rückblick")).toBeInTheDocument();
    expect(screen.queryByText("Älterer Log")).not.toBeInTheDocument();

    // Act: Suchbegriff anwenden, der nur einen Eintrag enthält.
    const searchInput = screen.getByRole("searchbox");
    await user.clear(searchInput);
    await user.type(searchInput, "rück");

    // Assert: Nur passende Einträge bleiben sichtbar.
    expect(screen.getByText("Wöchentlicher Rückblick")).toBeInTheDocument();
    expect(screen.queryByText("Heute lernen")).not.toBeInTheDocument();
  });
});

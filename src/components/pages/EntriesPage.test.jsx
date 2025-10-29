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
    const user = userEvent.setup();
    renderEntriesPage();

    expect(screen.getByText("Älterer Log")).toBeInTheDocument();
    const filterSelect = screen.getByRole("combobox");

    await user.selectOptions(filterSelect, "today");
    expect(screen.getByText("Heute lernen")).toBeInTheDocument();
    expect(screen.queryByText("Wöchentlicher Rückblick")).not.toBeInTheDocument();
    expect(screen.queryByText("Älterer Log")).not.toBeInTheDocument();

    await user.selectOptions(filterSelect, "week");
    expect(screen.getByText("Heute lernen")).toBeInTheDocument();
    expect(screen.getByText("Wöchentlicher Rückblick")).toBeInTheDocument();
    expect(screen.queryByText("Älterer Log")).not.toBeInTheDocument();

    const searchInput = screen.getByRole("searchbox");
    await user.clear(searchInput);
    await user.type(searchInput, "rück");
    expect(screen.getByText("Wöchentlicher Rückblick")).toBeInTheDocument();
    expect(screen.queryByText("Heute lernen")).not.toBeInTheDocument();
  });
});

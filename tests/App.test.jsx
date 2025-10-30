/**
 * @file App.test.jsx
 * @description Rauchtests für das Routing der App-Shell. Die Manager-Hooks werden gemockt,
 * damit die Tests deterministic bleiben.
 */

import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import App from "../src/App.jsx";

jest.mock("../src/hooks/useEntriesManager.js", () => jest.fn());
jest.mock("../src/hooks/useThemeManager.js", () => jest.fn());
jest.mock("../src/hooks/useInstallPrompt.js", () => jest.fn());

const useEntriesManager = jest.requireMock("../src/hooks/useEntriesManager.js");
const useThemeManager = jest.requireMock("../src/hooks/useThemeManager.js");
const useInstallPrompt = jest.requireMock("../src/hooks/useInstallPrompt.js");

const buildEntriesManager = () => ({
  entries: [{ id: "1", title: "Titel", content: "Content", createdAt: new Date().toISOString(), editedAt: new Date().toISOString() }],
  latestEntries: [{ id: "1", title: "Titel", content: "Content", createdAt: new Date().toISOString(), editedAt: new Date().toISOString() }],
  filteredEntries: [],
  sortedTrashEntries: [],
  trashEntryCount: 0,
  totalEntries: 1,
  todayCount: 1,
  weekCount: 1,
  formState: { title: "", content: "" },
  search: "",
  filter: "all",
  handleInputChange: jest.fn(),
  handleSubmit: jest.fn(),
  handleDelete: jest.fn(),
  handleUpdate: jest.fn(),
  handleRestore: jest.fn(),
  handleDeleteForever: jest.fn(),
  handleEmptyTrash: jest.fn(),
  handleSearchChange: jest.fn(),
  handleFilterChange: jest.fn(),
  handleExport: jest.fn(),
  handleImportFile: jest.fn(),
  applyImportedEntries: jest.fn(),
  resetQueryState: jest.fn()
});

beforeEach(() => {
  useEntriesManager.mockReturnValue(buildEntriesManager());
  useThemeManager.mockReturnValue({
    themeMode: "light",
    resolvedTheme: "light",
    cycleThemeMode: jest.fn()
  });
  useInstallPrompt.mockReturnValue({
    installPromptEvent: null,
    promptInstall: jest.fn()
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("App routing", () => {
  test("redirectet von / auf /home und zeigt Kennzahlen", () => {
    render(
      <MemoryRouter
        initialEntries={["/"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Logorama")).toBeInTheDocument();
    expect(screen.getByText("Gesamte Einträge")).toBeInTheDocument();
  });

  test("zeigt Footer nur auf der Hilfe-Seite", () => {
    render(
      <MemoryRouter
        initialEntries={["/help"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Hilfe & Einstieg" })
    ).toBeInTheDocument();
    expect(screen.getByText(/MIT License/)).toBeInTheDocument();
  });
});

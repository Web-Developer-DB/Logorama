import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { jest } from "@jest/globals";
import HomePage from "./HomePage.jsx";

const createProps = (overrides = {}) => ({
  stats: {
    totalEntries: 12,
    todayCount: 2,
    weekCount: 5,
    trashEntryCount: 1
  },
  latestEntries: [
    { id: "1", title: "Heute lernen", content: "React Hooks vertieft", createdAt: new Date().toISOString() }
  ],
  onDeleteEntry: jest.fn(),
  onUpdateEntry: jest.fn(),
  themeMode: "system",
  resolvedTheme: "light",
  onToggleTheme: jest.fn(),
  onInstallApp: jest.fn(),
  canInstall: true,
  ...overrides
});

describe("HomePage", () => {
  test("zeigt Kennzahlen und den Theme-Umschalter", () => {
    const props = createProps();
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage {...props} />
      </MemoryRouter>
    );

    expect(screen.getByText("Gesamte Einträge")).toBeInTheDocument();
    expect(screen.getByText("Heute verfasst")).toBeInTheDocument();
    expect(screen.getByText("Diese Woche")).toBeInTheDocument();
    expect(screen.getByText("Im Papierkorb")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Theme-Modus wechseln/ })
    ).toBeVisible();
  });

  test("navigiert zur NewEntryPage über die Hero-Aktion", async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(
      <MemoryRouter
        initialEntries={["/home"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/home" element={<HomePage {...props} />} />
          <Route path="/new" element={<h2>Neuer Eintrag</h2>} />
        </Routes>
      </MemoryRouter>
    );

    await act(async () => {
      await user.click(screen.getByRole("link", { name: /Neuantrag erstellen/i }));
    });
    expect(screen.getByRole("heading", { name: /Neuer Eintrag/i })).toBeInTheDocument();
  });
});

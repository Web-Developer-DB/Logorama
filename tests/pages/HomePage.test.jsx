/**
 * @file HomePage.test.jsx
 * @description UI-Regressionstests für die reduzierte Dashboard-Home.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { jest } from "@jest/globals";
import HomePage from "../../src/pages/HomePage.jsx";

/**
 * Baut ein konsistentes Props-Objekt auf. Einzelne Tests können Teilbereiche überschreiben,
 * ohne sich um den kompletten Strukturaufbau kümmern zu müssen.
 */
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
  ...overrides
});

describe("HomePage", () => {
  test("zeigt Dashboard-Kennzahlen und blendet doppelte Menue-Aktionen aus", () => {
    // Arrange
    const props = createProps();
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage {...props} />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText("Einträge diese Woche")).toBeInTheDocument();
    expect(screen.getByText("Heute erfasst")).toBeInTheDocument();
    expect(screen.getByText("Aktive Sammlung")).toBeInTheDocument();
    expect(screen.getByText("Neueste Einträge")).toBeInTheDocument();
    expect(screen.queryByText("Schnellaktionen")).not.toBeInTheDocument();
    expect(screen.queryByText("Ablage & Sicherung")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Einträge$/i })).not.toBeInTheDocument();
  });
});

/**
 * @file DesktopNav.test.jsx
 * @description Snapshot-freier Test für Desktop- und Mobilnavigation – prüft, ob Badges und
 * aktive Links korrekt gerendert werden.
 */

import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import DesktopNav from "./DesktopNav.jsx";
import MobileNav from "./MobileNav.jsx";

const stats = {
  totalEntries: 4,
  trashEntryCount: 1
};

describe("Navigation", () => {
  test("DesktopNav zeigt Badges und aktive Route", () => {
    render(
      <MemoryRouter
        initialEntries={["/entries"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <DesktopNav stats={stats} />
      </MemoryRouter>
    );

    expect(screen.getByText("Einträge")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Einträge/ })).toHaveClass(
      "desktop-nav__link--active"
    );
  });

  test("MobileNav rendert identische Datenbasis", () => {
    render(
      <MemoryRouter
        initialEntries={["/trash"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <MobileNav stats={stats} />
      </MemoryRouter>
    );

    expect(screen.getByText("Papierkorb")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Papierkorb/ })).toHaveClass(
      "mobile-nav__link--active"
    );
  });
});

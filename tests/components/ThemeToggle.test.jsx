/**
 * @file ThemeToggle.test.jsx
 * @description Deckt beide Varianten (Hero & Mobile Nav) ab und prüft den Toggle-Callback.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "../../src/components/ThemeToggle.jsx";

describe("ThemeToggle", () => {
  test("zeigt Label entsprechend des Modus und löst Toggle aus", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    render(<ThemeToggle mode="system" resolvedTheme="dark" onToggle={onToggle} />);

    const heroButton = screen.getByRole("button", { name: /Theme-Modus wechseln/ });
    expect(heroButton).toHaveTextContent("Systemmodus");
    await user.click(heroButton);
    expect(onToggle).toHaveBeenCalled();
  });

  test("rendert mobile Variante mit kurzem Label", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    render(<ThemeToggle mode="light" resolvedTheme="light" onToggle={onToggle} variant="nav" />);

    const navButton = screen.getByRole("button", { name: /Theme-Modus wechseln/ });
    expect(navButton).toHaveTextContent("Hell");
    await user.click(navButton);
    expect(onToggle).toHaveBeenCalled();
  });
});

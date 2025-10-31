/**
 * @file HelpPage.test.jsx
 * @description Testet die TOC-Navigation und stellt sicher, dass Smooth-Scroll-Handler greifen.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpPage from "../../src/pages/HelpPage.jsx";

describe("HelpPage", () => {
  test("scrollt und fokussiert den Zielabschnitt über die Schnellnavigation", async () => {
    const user = userEvent.setup();
    const originalScroll = window.HTMLElement.prototype.scrollIntoView;
    const scrollMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollMock;

    render(<HelpPage />);

    await user.click(screen.getByRole("button", { name: "Schnellüberblick" }));

    expect(scrollMock).toHaveBeenCalled();
    const section = document.getElementById("overview");
    expect(section).not.toBeNull();
    expect(section?.contains(document.activeElement)).toBe(true);

    window.HTMLElement.prototype.scrollIntoView = originalScroll;
  });
});

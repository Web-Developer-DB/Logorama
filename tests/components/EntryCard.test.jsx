/**
 * @file EntryCard.test.jsx
 * @description Testet das Inline-Editing und Guard-Rails rund um EntryCard.
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import EntryCard from "../../src/components/EntryCard.jsx";

const baseEntry = {
  id: "entry-1",
  title: "Initialer Titel",
  content: "Ausgangsinhalt",
  createdAt: new Date().toISOString()
};

describe("EntryCard", () => {
  test("ermöglicht Inline-Editing und persistiert Änderungen", async () => {
    // Arrange
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    render(<EntryCard entry={baseEntry} onUpdate={onUpdate} onDelete={jest.fn()} />);

    // Act: Edit-Modus betreten
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Bearbeiten/i }));
    });

    const titleInput = screen.getByPlaceholderText("Ohne Titel");
    const contentEditor = screen.getByPlaceholderText("Eintrag bearbeiten");

    // Act: Felder anpassen
    await act(async () => {
      await user.clear(titleInput);
      await user.type(titleInput, "Bearbeiteter Titel");
    });
    await act(async () => {
      await user.clear(contentEditor);
      await user.type(contentEditor, "Aktualisierte Notiz");
    });

    // Act: Änderungen speichern
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Speichern/i }));
    });

    // Assert
    expect(onUpdate).toHaveBeenCalledWith("entry-1", {
      title: "Bearbeiteter Titel",
      content: "Aktualisierte Notiz"
    });
  });

  test("verlässt den Editiermodus ohne Persistenz, wenn keine Änderungen vorliegen", async () => {
    // Arrange
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    render(<EntryCard entry={baseEntry} onUpdate={onUpdate} onDelete={jest.fn()} />);

    // Act: Edit-Modus öffnen und unverändert schließen
    const toggleButton = screen.getByRole("button", { name: /Bearbeiten/i });
    await act(async () => {
      await user.click(toggleButton);
    });
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Speichern/i }));
    });

    // Assert: Kein Persistierungs-Callback, Button zurück im Ausgangszustand
    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Bearbeiten/i })).toBeInTheDocument();
  });
});

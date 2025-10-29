import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import EntryCard from "./EntryCard.jsx";

const baseEntry = {
  id: "entry-1",
  title: "Initialer Titel",
  content: "Ausgangsinhalt",
  createdAt: new Date().toISOString()
};

describe("EntryCard", () => {
  test("ermöglicht Inline-Editing und persistiert Änderungen", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    render(<EntryCard entry={baseEntry} onUpdate={onUpdate} onDelete={jest.fn()} />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Bearbeiten/i }));
    });

    const titleInput = screen.getByPlaceholderText("Ohne Titel");
    const contentEditor = screen.getByPlaceholderText("Eintrag bearbeiten");

    await act(async () => {
      await user.clear(titleInput);
      await user.type(titleInput, "Bearbeiteter Titel");
    });
    await act(async () => {
      await user.clear(contentEditor);
      await user.type(contentEditor, "Aktualisierte Notiz");
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Speichern/i }));
    });

    expect(onUpdate).toHaveBeenCalledWith("entry-1", {
      title: "Bearbeiteter Titel",
      content: "Aktualisierte Notiz"
    });
  });

  test("verlässt den Editiermodus ohne Persistenz, wenn keine Änderungen vorliegen", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    render(<EntryCard entry={baseEntry} onUpdate={onUpdate} onDelete={jest.fn()} />);

    const toggleButton = screen.getByRole("button", { name: /Bearbeiten/i });
    await act(async () => {
      await user.click(toggleButton);
    });
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Speichern/i }));
    });

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Bearbeiten/i })).toBeInTheDocument();
  });
});

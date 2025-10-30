/**
 * @file TrashPage.test.jsx
 * @description Testet die wichtigsten Interaktionspfade im Papierkorb: Restore,
 * Hard-Delete und Sammel-Löschung.
 */

import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrashPage from "../../src/pages/TrashPage.jsx";

const initialEntries = [
  {
    id: "restore",
    title: "Wiederherstellbarer Eintrag",
    content: "Kann zurück in die Liste",
    createdAt: new Date().toISOString(),
    deletedAt: new Date().toISOString()
  },
  {
    id: "delete",
    title: "Löschkandidat",
    content: "Soll endgültig entfernt werden",
    createdAt: new Date().toISOString(),
    deletedAt: new Date().toISOString()
  },
  {
    id: "bulk",
    title: "Für den Papierkorb leeren Test",
    content: "Wird über die Sammelaktion entfernt",
    createdAt: new Date().toISOString(),
    deletedAt: new Date().toISOString()
  }
];

/**
 * Helfer, der `TrashPage` mit einem veränderbaren lokalen Array rendert. So lassen
 * sich Zustandsänderungen simulieren, die normalerweise vom Entries-Manager kämen.
 */
const renderTrashPage = () => {
  let items = [...initialEntries];

  const handleRestore = (id) => {
    items = items.filter((entry) => entry.id !== id);
    rerenderPage();
  };

  const handleDeleteForever = (id) => {
    items = items.filter((entry) => entry.id !== id);
    rerenderPage();
  };

  const handleEmptyTrash = () => {
    items = [];
    rerenderPage();
  };

  let rerenderPage;

  const renderResult = render(
    <TrashPage
      entries={items}
      onRestoreEntry={handleRestore}
      onDeleteForever={handleDeleteForever}
      onEmptyTrash={handleEmptyTrash}
      formatDateTime={(value) => value}
    />
  );

  rerenderPage = () => {
    renderResult.rerender(
      <TrashPage
        entries={items}
        onRestoreEntry={handleRestore}
        onDeleteForever={handleDeleteForever}
        onEmptyTrash={handleEmptyTrash}
        formatDateTime={(value) => value}
      />
    );
  };

  return renderResult;
};

describe("TrashPage", () => {
  test("unterstützt Wiederherstellen, endgültiges Löschen und das Leeren des Papierkorbs", async () => {
    // Arrange
    const user = userEvent.setup();
    renderTrashPage();

    // Restore flow
    await act(async () => {
      await user.click(screen.getAllByRole("button", { name: /Wiederherstellen/i })[0]);
    });
    expect(screen.queryByText("Wiederherstellbarer Eintrag")).not.toBeInTheDocument();

    // Permanent delete flow: zweistufige Sicherheitsbestätigung (ConfirmButton).
    const deleteEntry = screen.getByText("Löschkandidat").closest("article");
    const deleteButton = within(deleteEntry).getByRole("button", { name: /^Löschen$/i });
    await act(async () => {
      await user.click(deleteButton);
    });
    await act(async () => {
      await user.click(within(deleteEntry).getByRole("button", { name: /Endgültig löschen/i }));
    });
    expect(screen.queryByText("Löschkandidat")).not.toBeInTheDocument();

    // Empty trash flow
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Papierkorb leeren/i }));
    });
    expect(screen.queryByText("Für den Papierkorb leeren Test")).not.toBeInTheDocument();
    expect(screen.getByText(/Papierkorb ist leer/i)).toBeInTheDocument();
  });
});

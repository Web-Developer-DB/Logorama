import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrashPage from "./TrashPage.jsx";

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

const TrashHarness = () => {
  const [items, setItems] = useState(initialEntries);

  const handleRestore = (id) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleDeleteForever = (id) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleEmptyTrash = () => {
    setItems([]);
  };

  return (
    <TrashPage
      entries={items}
      onRestoreEntry={handleRestore}
      onDeleteForever={handleDeleteForever}
      onEmptyTrash={handleEmptyTrash}
      formatDateTime={(value) => value}
    />
  );
};

describe("TrashPage", () => {
  test("unterstützt Wiederherstellen, endgültiges Löschen und das Leeren des Papierkorbs", async () => {
    const user = userEvent.setup();
    render(<TrashHarness />);

    // Restore flow
    await user.click(screen.getAllByRole("button", { name: /Wiederherstellen/i })[0]);
    expect(screen.queryByText("Wiederherstellbarer Eintrag")).not.toBeInTheDocument();

    // Permanent delete flow
    const deleteEntry = screen.getByText("Löschkandidat").closest("article");
    const deleteButton = within(deleteEntry).getByRole("button", { name: /^Löschen$/i });
    await user.click(deleteButton);
    await user.click(within(deleteEntry).getByRole("button", { name: /Endgültig löschen/i }));
    expect(screen.queryByText("Löschkandidat")).not.toBeInTheDocument();

    // Empty trash flow
    await user.click(screen.getByRole("button", { name: /Papierkorb leeren/i }));
    expect(screen.queryByText("Für den Papierkorb leeren Test")).not.toBeInTheDocument();
    expect(screen.getByText(/Papierkorb ist leer/i)).toBeInTheDocument();
  });
});

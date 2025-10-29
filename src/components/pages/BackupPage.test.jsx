import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import BackupPage from "./BackupPage.jsx";
import { normalizeEntriesPayload } from "../../utils/entries.js";

const initialEntries = [
  {
    id: "entry-1",
    title: "Alpha Log",
    content: "Erster Eintrag",
    createdAt: new Date().toISOString()
  }
];

const BackupHarness = ({
  onExport = jest.fn(),
  onToggleDriveSync = jest.fn(),
  onDriveSync = jest.fn(),
  onDriveRestore = jest.fn()
} = {}) => {
  const [items, setItems] = useState(initialEntries);

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizeEntriesPayload(parsed);
    setItems(normalized);
  };

  return (
    <>
      <BackupPage
        onExport={onExport}
        onImportFile={handleImportFile}
        disableExport={!items.length}
        driveSyncEnabled={false}
        onToggleDriveSync={onToggleDriveSync}
        driveStatus="connected"
        driveLastSync={items[0]?.createdAt}
        driveError={null}
        onDriveSync={onDriveSync}
        onDriveRestore={onDriveRestore}
        driveIsSyncing={false}
      />
      <ul aria-label="Backup-Einträge">
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </>
  );
};

describe("BackupPage", () => {
  test("stößt Export an und importiert neue Einträge erfolgreich", async () => {
    const user = userEvent.setup();
    const handleExport = jest.fn();
    const handleToggleDriveSync = jest.fn();
    const handleDriveSync = jest.fn();
    const handleDriveRestore = jest.fn();

    const { container } = render(
      <BackupHarness
        onExport={handleExport}
        onToggleDriveSync={handleToggleDriveSync}
        onDriveSync={handleDriveSync}
        onDriveRestore={handleDriveRestore}
      />
    );

    expect(screen.getByText("Alpha Log")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Daten sichern/i }));
    expect(handleExport).toHaveBeenCalledTimes(1);

    const driveToggle = screen.getByRole("checkbox", {
      name: /Mit Google Drive synchronisieren/i
    });
    await user.click(driveToggle);
    expect(handleToggleDriveSync).toHaveBeenCalledTimes(1);

    const fileInput = container.querySelector('input[type="file"]');
    const importPayload = [
      {
        id: "entry-2",
        title: "Importierter Eintrag",
        content: "Erfolgreich wiederhergestellt",
        createdAt: new Date().toISOString()
      }
    ];
    const file = new File([JSON.stringify(importPayload)], "backup.json", {
      type: "application/json"
    });
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(JSON.stringify(importPayload))
    });

    await user.upload(fileInput, file);
    expect(await screen.findByText("Importierter Eintrag")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Log")).not.toBeInTheDocument();
  });
});

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

const createDriveSync = (overrides = {}) => ({
  status: "idle",
  error: null,
  isConnected: false,
  lastSync: null,
  connect: jest.fn(),
  pull: jest.fn(),
  push: jest.fn(),
  ...overrides
});

const renderBackupPage = ({ onExport = jest.fn(), driveSync = createDriveSync() } = {}) => {
  let items = [...initialEntries];
  let rerenderPage = () => {};

  const setEntries = (payload) => {
    if (Array.isArray(payload)) {
      items = payload;
      rerenderPage();
    }
  };

  const getEntriesForExport = () => items;

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizeEntriesPayload(parsed);
    items = normalized;
    rerenderPage();
  };

  const renderResult = render(
    <>
      <BackupPage
        entries={items}
        setEntries={setEntries}
        getEntriesForExport={getEntriesForExport}
        onExport={onExport}
        onImportFile={handleImportFile}
        disableExport={!items.length}
        driveSync={driveSync}
      />
      <ul aria-label="Backup-Einträge">
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </>
  );

  rerenderPage = () => {
    renderResult.rerender(
      <>
        <BackupPage
          entries={items}
          setEntries={setEntries}
          getEntriesForExport={getEntriesForExport}
          onExport={onExport}
          onImportFile={handleImportFile}
          disableExport={!items.length}
          driveSync={driveSync}
        />
        <ul aria-label="Backup-Einträge">
          {items.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      </>
    );
  };

  return renderResult;
};

describe("BackupPage", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.__LOGORAMA_GOOGLE_CLIENT_ID__ = "test-client-id";
    }
  });

  test("zeigt Google-Verbindungsbutton und stößt Connect an", async () => {
    const user = userEvent.setup();
    const driveSync = createDriveSync();
    renderBackupPage({ driveSync });

    expect(screen.getByText("Alpha Log")).toBeInTheDocument();

    const connectButton = screen.getByRole("button", { name: /Mit Google verbinden/i });
    expect(connectButton).toBeEnabled();

    await user.click(connectButton);
    expect(driveSync.connect).toHaveBeenCalledTimes(1);
  });

  test("führt Export, Import sowie Drive-Aktionen aus", async () => {
    const driveSync = createDriveSync({ status: "connected", isConnected: true });

    const user = userEvent.setup();
    const handleExport = jest.fn();
    const { container } = renderBackupPage({ onExport: handleExport, driveSync });

    await user.click(screen.getByRole("button", { name: /Daten sichern/i }));
    expect(handleExport).toHaveBeenCalledTimes(1);

    const pullButton = screen.getByRole("button", { name: /Aus Google Drive laden/i });
    await user.click(pullButton);
    expect(driveSync.pull).toHaveBeenCalledTimes(1);

    const pushButton = screen.getByRole("button", { name: /Jetzt synchronisieren/i });
    await user.click(pushButton);
    expect(driveSync.push).toHaveBeenCalledTimes(1);

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

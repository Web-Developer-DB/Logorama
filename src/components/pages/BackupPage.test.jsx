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

const renderBackupPage = ({ onExport = jest.fn() } = {}) => {
  let items = [...initialEntries];
  let rerenderPage = () => {};

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
        onExport={onExport}
        onImportFile={handleImportFile}
        disableExport={!items.length}
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
          onExport={onExport}
          onImportFile={handleImportFile}
          disableExport={!items.length}
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
  test("führt Export und Import aus", async () => {
    const user = userEvent.setup();
    const handleExport = jest.fn();
    const { container } = renderBackupPage({ onExport: handleExport });

    await user.click(screen.getByRole("button", { name: /Daten sichern/i }));
    expect(handleExport).toHaveBeenCalledTimes(1);

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

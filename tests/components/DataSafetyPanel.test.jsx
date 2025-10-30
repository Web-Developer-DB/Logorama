/**
 * @file DataSafetyPanel.test.jsx
 * @description Prüft die Export- und Import-Schaltflächen inklusive Disabled-State.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DataSafetyPanel from "../../src/components/DataSafetyPanel.jsx";

describe("DataSafetyPanel", () => {
  test("reicht Export/Import-Callbacks weiter und blendet Disable-State ein", async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();
    const onImportFile = jest.fn();

    const { container, rerender } = render(
      <DataSafetyPanel onExport={onExport} onImportFile={onImportFile} disableExport={true} />
    );

    const exportButton = screen.getByRole("button", { name: /Daten sichern/i });
    expect(exportButton).toBeDisabled();

    const importButton = screen.getByRole("button", { name: /Daten wiederherstellen/i });
    await user.click(importButton);

    const fileInput = container.querySelector("input[type='file']");
    fireEvent.change(fileInput, { target: { files: [new File(["{}"], "backup.json")] } });
    expect(onImportFile).toHaveBeenCalled();

    // Re-render mit aktiviertem Export.
    rerender(<DataSafetyPanel onExport={onExport} onImportFile={onImportFile} disableExport={false} />);
    await user.click(screen.getByRole("button", { name: /Daten sichern/i }));
    expect(onExport).toHaveBeenCalled();
  });
});

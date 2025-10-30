/**
 * @file ConfirmButton.test.jsx
 * @description Validiert den Zwei-Schritt-Bestätigungsablauf.
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmButton from "../../src/components/ConfirmButton.jsx";

describe("ConfirmButton", () => {
  test("fordert Bestätigung an und ruft Callback erst beim zweiten Klick auf", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();

    render(
      <ConfirmButton
        initialLabel="Löschen"
        confirmLabel="Sicher?"
        onConfirm={onConfirm}
        className="base"
        confirmClassName="active"
      />
    );

    const button = screen.getByRole("button", { name: "Löschen" });
    expect(button).toHaveClass("base");

    await act(async () => {
      await user.click(button);
    });
    const confirmState = screen.getByRole("button", { name: "Sicher?" });
    expect(confirmState).toHaveClass("base");
    expect(confirmState).toHaveClass("active");
    expect(onConfirm).not.toHaveBeenCalled();

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Sicher?" }));
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

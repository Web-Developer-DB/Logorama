/**
 * @file EntryForm.test.jsx
 * @description Fokus-Tests für das Formular zum Anlegen neuer Einträge. Nutzt
 * einen kleinen Wrapper, um kontrollierte Props zu simulieren.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import EntryForm from "../../src/components/EntryForm.jsx";

/**
 * Hilfsfunktion, die das Formular mit einem kontrollierten State rendert.
 * Simuliert ungefähr das Verhalten von `useEntriesManager`, indem sie
 * `rerender` aufruft, sobald ein Input aktualisiert wird.
 *
 * @param {jest.Mock} [onSubmit=jest.fn()] Mock, das den Submit entgegennimmt.
 */
const renderEntryForm = (onSubmit = jest.fn()) => {
  let formState = { title: "", content: "" };
  let rerenderForm;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    formState = { ...formState, [name]: value };
    rerenderForm();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...formState });
  };

  const renderResult = render(
    <EntryForm formState={formState} onInputChange={handleInputChange} onSubmit={handleSubmit} />
  );

  rerenderForm = () => {
    renderResult.rerender(
      <EntryForm
        formState={formState}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    );
  };

  return { ...renderResult, onSubmit: handleSubmit };
};

describe("EntryForm", () => {
  test("erfasst Titel und Inhalt und meldet den Submit nach außen", async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderEntryForm(onSubmit);

    // Act
    await user.type(screen.getByLabelText(/Titel/i), "Mein erster Log");
    await user.type(screen.getByLabelText(/Eintrag/i), "Hello World");
    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Mein erster Log",
      content: "Hello World"
    });
  });

  test("blockiert die Übertragung, wenn kein Inhalt vorhanden ist", async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderEntryForm(onSubmit);

    // Act: Nur den optionalen Titel füllen.
    await user.type(screen.getByLabelText(/Titel/i), "Nur ein Titel");
    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    // Assert
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

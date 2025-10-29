import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import EntryForm from "./EntryForm.jsx";

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
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderEntryForm(onSubmit);

    await user.type(screen.getByLabelText(/Titel/i), "Mein erster Log");
    await user.type(screen.getByLabelText(/Eintrag/i), "Hello World");
    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Mein erster Log",
      content: "Hello World"
    });
  });

  test("blockiert die Übertragung, wenn kein Inhalt vorhanden ist", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderEntryForm(onSubmit);

    await user.type(screen.getByLabelText(/Titel/i), "Nur ein Titel");
    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

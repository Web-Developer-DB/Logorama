import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import EntryForm from "./EntryForm.jsx";

const TestHarness = ({ onSubmit = jest.fn() }) => {
  const [formState, setFormState] = useState({ title: "", content: "" });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...formState });
  };

  return (
    <EntryForm
      formState={formState}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
    />
  );
};

describe("EntryForm", () => {
  test("erfasst Titel und Inhalt und meldet den Submit nach außen", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();

    render(<TestHarness onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/Titel/i), "Mein erster Log");
    await user.type(screen.getByLabelText(/Eintrag/i), "Hello World");
    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      title: "Mein erster Log",
      content: "Hello World"
    });
  });

  test("blockiert die Übertragung, wenn kein Inhalt vorhanden ist", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();

    render(<TestHarness onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/Titel/i), "Nur ein Titel");
    await user.click(screen.getByRole("button", { name: /Speichern/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

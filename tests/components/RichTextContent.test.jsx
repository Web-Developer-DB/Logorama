/**
 * @file RichTextContent.test.jsx
 * @description Stellt sicher, dass Markdown und Formeln im Beitragsrenderer ankommen.
 */

import { render, screen } from "@testing-library/react";
import RichTextContent from "../../src/components/RichTextContent.jsx";

describe("RichTextContent", () => {
  test("rendert Ueberschriften, Zitate und KaTeX fuer kopierte ChatGPT-Formeln", () => {
    const content = [
      "## Gesamturteil dieses Schritts",
      "",
      "Der wichtigste Befund ist:",
      "",
      "[",
      "\\boxed{\\text{Stabilitaet allein reicht nicht.}}",
      "]",
      "",
      "> Ohne mikroskopische Verknuepfung bleibt noch versteckte Flexibilitaet."
    ].join("\n");

    const { container } = render(<RichTextContent content={content} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Gesamturteil dieses Schritts/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ohne mikroskopische Verknuepfung bleibt noch versteckte Flexibilitaet/i)
    ).toBeInTheDocument();
    expect(container.querySelector(".katex-display")).toBeInTheDocument();
    expect(container.querySelector(".katex-mathml")).toBeInTheDocument();
  });
});

/**
 * @file richText.test.js
 * @description Tests für die Normalisierung von Markdown-/LaTeX-Kopien.
 */

import { normalizeMathMarkup } from "../../src/utils/richText.js";

describe("normalizeMathMarkup", () => {
  test("konvertiert ChatGPT-Display-Math in remark-kompatible Blocksyntax", () => {
    const input = [
      "Und die saubere Gleichung lautet also:",
      "",
      "[",
      "\\boxed{",
      "- Z_{\\rm eff} \\nabla^2 \\Xi",
      "+ \\lambda_\\Xi \\Xi^3",
      "}",
      "]"
    ].join("\n");

    expect(normalizeMathMarkup(input)).toBe([
      "Und die saubere Gleichung lautet also:",
      "",
      "$$",
      "\\boxed{",
      "- Z_{\\rm eff} \\nabla^2 \\Xi",
      "+ \\lambda_\\Xi \\Xi^3",
      "}",
      "$$"
    ].join("\n"));
  });

  test("wandelt inline-LaTeX-Klammern in Markdown-Math um", () => {
    expect(normalizeMathMarkup("Masseskala \\(m^2\\) bleibt sichtbar.")).toBe(
      "Masseskala $m^2$ bleibt sichtbar."
    );
  });
});

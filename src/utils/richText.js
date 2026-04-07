/**
 * @file richText.js
 * @description Normalisiert kopierte ChatGPT-/LaTeX-Blöcke für das Markdown-Rendering.
 */

const LINE_WRAPPED_DISPLAY_MATH_PATTERN = /(^|\n)([ \t]*)\\?\[\s*\n([\s\S]*?)\n[ \t]*\\?\](?=\n|$)/g;
const DISPLAY_MATH_PATTERN = /\\\[([\s\S]*?)\\\]/g;
const INLINE_MATH_PATTERN = /\\\((.+?)\\\)/g;

const looksLikeMath = (value) => /\\[A-Za-z]+|[_^=]/u.test(value);

/**
 * Vereinheitlicht gängige LaTeX-Delimiters aus ChatGPT-Kopien auf remark-kompatible Syntax.
 *
 * Unterstützt:
 * - `\(...\)` -> `$...$`
 * - `\[...\]` -> `$$...$$`
 * - mehrzeilige `[` / `]`-Blöcke mit LaTeX-Inhalt -> `$$...$$`
 *
 * @param {string} value Rohtext aus dem Editor.
 * @returns {string} Für Markdown-/Math-Parser vorbereiteter Text.
 */
export const normalizeMathMarkup = (value = "") =>
  value
    .replace(LINE_WRAPPED_DISPLAY_MATH_PATTERN, (match, leading, indentation, inner) => {
      const trimmedInner = inner.trim();

      if (!trimmedInner || !looksLikeMath(trimmedInner)) {
        return match;
      }

      return `${leading}${indentation}$$\n${trimmedInner}\n${indentation}$$`;
    })
    .replace(DISPLAY_MATH_PATTERN, (_, inner) => {
      const trimmedInner = inner.trim();
      return trimmedInner ? `\n$$\n${trimmedInner}\n$$\n` : "";
    })
    .replace(INLINE_MATH_PATTERN, (_, inner) => {
      const trimmedInner = inner.trim();
      return trimmedInner ? `$${trimmedInner}$` : "";
    });

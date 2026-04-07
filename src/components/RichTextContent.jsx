/**
 * @file RichTextContent.jsx
 * @description Rendert Eintragsinhalt als Markdown mit KaTeX-Unterstützung für Formeln.
 */

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { normalizeMathMarkup } from "../utils/richText.js";

const remarkPlugins = [remarkGfm, remarkMath, remarkBreaks];
const rehypePlugins = [rehypeKatex];

/**
 * Einheitlicher Renderer für Beiträge, der Markdown-Struktur und wissenschaftliche Formeln versteht.
 *
 * @param {Object} props React-Props.
 * @param {string} props.content Rohinhalt aus dem Editor.
 * @param {string} [props.className] Zusätzliche CSS-Klassen für den Container.
 * @returns {JSX.Element} Gerenderter Rich-Text-Block.
 */
const RichTextContent = ({ content = "", className = "" }) => {
  const classes = ["rich-content", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
        {normalizeMathMarkup(content)}
      </ReactMarkdown>
    </div>
  );
};

export default memo(RichTextContent);

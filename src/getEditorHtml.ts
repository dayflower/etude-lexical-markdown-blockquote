import { $generateHtmlFromNodes } from "@lexical/html";
import type { BaseSelection, LexicalEditor } from "lexical";

/**
 * Serializes a live editor's current content to semantic HTML.
 *
 * A thin wrapper around the standard `$generateHtmlFromNodes` that handles the
 * required `editor.read()`, so callers don't have to import `@lexical/html` or
 * remember the read wrapper. Pass a `selection` to export only the selected
 * nodes.
 *
 * The output relies on each node's built-in `exportDOM`: the blockquote etude
 * uses Lexical's standard `QuoteNode`, `HeadingNode`, and list nodes, so a
 * quoted paragraph becomes `<blockquote>...</blockquote>` rather than the
 * editing DOM (whose `>` marker is a CSS `::before` pseudo-element only).
 */
export function getEditorHtml(
  editor: LexicalEditor,
  selection?: BaseSelection | null,
): string {
  return editor.read(() => $generateHtmlFromNodes(editor, selection));
}

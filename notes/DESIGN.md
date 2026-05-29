# Architecture

This is a React + Lexical rich text editor etude implementing Markdown-style blockquotes with live Markdown serialization. The build outputs to `docs/` for GitHub Pages deployment.

## Editor structure

`Editor.tsx` sets up a `LexicalComposer` with a dual-panel layout: the rich editor on the left and a Markdown source preview on the right. The editor also exposes two behavior toggles:

- **Show markup** — adds a visual `>` marker before rendered blockquotes through the `.show-brackets` CSS class.
- **Exit blockquote on empty line** — changes Enter behavior so an empty paragraph inside a quote exits the quote instead of inserting another quoted line.

The custom plugins are:

- **`BlockquoteBehaviorPlugin`** — registers high-priority Enter and Backspace handlers for quote-specific editing behavior, plus an update listener that converts Markdown block markers typed inside a quote.
- **`ListBehaviorPlugin`** — adjusts list exits inside quotes and handles Shift+Tab at the start of a top-level list item.
- **`MarkdownPreviewPlugin`** — serializes the current editor state back to Markdown for the right-hand preview.
- **`editorConfig.ts`** — registers Lexical nodes, the theme, and the Markdown transformer set used by both shortcuts and export.

## Markdown blockquote transformer

`blockquoteMarkdown.ts` defines `createBlockquoteTransformer()`, a custom `ElementTransformer` for `QuoteNode`. It replaces Lexical's default quote handling so Markdown import/export can preserve richer block structures inside quotes.

On import and Markdown shortcut replacement, the transformer strips the leading `> ` marker and converts the remaining content into the most specific block it can identify:

- `# ` through `###### ` become heading nodes.
- `- `, `* `, and `+ ` become unordered lists.
- `1. ` and other numbered markers become ordered lists.
- Nested `> ` markers become nested quote nodes.
- Everything else becomes a paragraph.

On export, a quote is flattened back to Markdown by exporting each child block, splitting the result into lines, and prefixing each line with `>`. Empty lines become a bare `>` so the quoted shape survives round trips.

During Markdown import, adjacent quote nodes are merged. When adjacent quoted list blocks have the same list type, their list items are merged into one list so multi-line quoted lists do not fragment into separate lists.

## Quote editing behavior

`BlockquoteBehaviorPlugin.tsx` delegates most structural work to `blockquoteBehavior.ts`.

Enter normally falls through to Lexical's default behavior, except for two cases:

- Shift+Enter is ignored by the plugin so Lexical can handle the soft-break behavior.
- When `exitBlockquoteOnEmptyLine` is enabled and the selection is in an empty quoted paragraph, the empty paragraph is replaced with a plain paragraph after the quote.

Backspace handles quote boundaries explicitly:

- At an empty quoted paragraph, the editor exits the quote.
- At the very start of a quote with no previous quote sibling, the quote is unwrapped into its child blocks.
- At the start of a quote after another quote, the current quote is merged into the previous quote.
- An empty quote is replaced with a plain paragraph so the caret has a valid place to land.

When exiting from an empty paragraph in the middle of a quote, trailing quoted blocks are moved into a new quote after the inserted plain paragraph. This preserves the content before and after the exit point instead of flattening the rest of the quote.

The plugin also watches collapsed text selections inside quotes. When the user types a complete block marker such as `# `, `- `, `1. `, or `> ` at the start of a quoted paragraph, `transformBlockquoteChildMarkdown()` converts that paragraph into the corresponding nested block while keeping it inside the quote.

## List behavior inside quotes

`ListBehaviorPlugin.tsx` registers high-priority Enter and Tab handlers implemented in `listBehavior.ts`.

Enter on an empty top-level list item uses Lexical's standard list-exit behavior outside quotes. Inside a quote, it creates a plain paragraph after the current quoted list. If there are list items after the empty item, they are copied into a new trailing list after that paragraph so the user can split a quoted list without losing the remaining list structure.

Shift+Tab at the start of a top-level list item converts that item into a paragraph. This gives the user a direct way to leave list structure when the item is already at indent level 0.

## Markdown preview and editor config

`MarkdownPreviewPlugin.tsx` listens for editor updates and calls `$convertToMarkdownString(markdownTransformers)`. The same `markdownTransformers` array is passed to `MarkdownShortcutPlugin`, so the shortcuts and preview share the same blockquote rules.

`editorConfig.ts` registers `HeadingNode`, `QuoteNode`, `ListNode`, and `ListItemNode`, along with a Tailwind-based Lexical theme for headings, lists, paragraphs, quotes, links, and text styles.

## CSS-driven markup display

The normal quote rendering comes from the Lexical `quote` theme class: a left border, spacing, and muted text color.

The optional markup display is CSS-only. When the editor wrapper has `.show-brackets`, `src/index.css` adds a `blockquote::before` pseudo-element containing `>`, positioned just to the left of the quote border. This keeps the editor's document model unchanged while still letting the user inspect the Markdown marker visually.

## Implementation notes

Areas that required more than a straight Lexical mapping:

- **Quoted child block conversion.** Lexical's Markdown shortcut plugin can create a quote from `> ` at the top level, but block markers typed inside an existing quote need a separate update listener because they should replace only the quoted child paragraph, not the outer quote.
- **Quote splitting on empty lines.** Exiting a quote from the middle must preserve both sides of the quote. The implementation removes the empty paragraph, inserts a plain paragraph after the quote, and moves trailing quote children into a new quote after that paragraph.
- **Quoted list exits.** Lexical's default list exit is not enough inside a quote because the plain paragraph should be outside the quote while any remaining list items should stay quoted. `exitQuoteListAtEmptyItem()` performs that split explicitly.
- **Markdown export of nested content.** `exportQuoteNode()` delegates each child block to the appropriate exporter and then prefixes every produced line. This makes headings, lists, nested quotes, and plain paragraphs share one quote export path.

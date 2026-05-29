import { ListItemNode, ListNode } from "@lexical/list";
import {
  BOLD_STAR,
  BOLD_UNDERSCORE,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  type Transformer,
  UNORDERED_LIST,
} from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

export const markdownTransformers: Transformer[] = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  INLINE_CODE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
];

const theme = {
  heading: {
    h1: "text-3xl font-bold mb-3",
    h2: "text-2xl font-bold mb-3",
    h3: "text-xl font-semibold mb-2",
    h4: "text-lg font-semibold mb-2",
    h5: "text-base font-semibold mb-2",
    h6: "text-sm font-semibold uppercase tracking-wide mb-2",
  },
  list: {
    listitem: "ml-6 mb-1",
    nested: {
      listitem: "list-none",
    },
    ol: "list-decimal mb-2",
    ul: "list-disc mb-2",
  },
  paragraph: "mb-2",
  quote: "relative border-l-4 border-gray-300 pl-4 my-2 text-gray-700",
  link: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
  text: {
    bold: "font-bold",
    code: "rounded bg-gray-100 px-1 py-0.5 font-mono text-sm",
    italic: "italic",
    strikethrough: "line-through",
  },
};

function onError(error: Error) {
  console.error(error);
}

export const initialConfig = {
  namespace: "LexicalMarkdownBlockquote",
  theme,
  onError,
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
};

import { $convertToMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { markdownTransformers } from "./editorConfig";

interface Props {
  onMarkdown: (md: string) => void;
}

export default function MarkdownPreviewPlugin({ onMarkdown }: Props) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        onMarkdown($convertToMarkdownString(markdownTransformers));
      });
    });
  }, [editor, onMarkdown]);

  return null;
}

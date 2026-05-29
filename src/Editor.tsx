import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useState } from "react";
import BlockquoteBehaviorPlugin from "./BlockquoteBehaviorPlugin";
import { initialConfig, markdownTransformers } from "./editorConfig";
import ListBehaviorPlugin from "./ListBehaviorPlugin";
import MarkdownPreviewPlugin from "./MarkdownPreviewPlugin";

export default function Editor() {
  const [exitBlockquoteOnEmptyLine, setExitBlockquoteOnEmptyLine] =
    useState(false);
  const [showMarkup, setShowMarkup] = useState(false);
  const [markdownSource, setMarkdownSource] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1">Rich editor</p>
          <LexicalComposer initialConfig={initialConfig}>
            <div
              className={`relative border border-gray-300 rounded-lg overflow-hidden ring-blue-400 focus-within:ring-2${showMarkup ? " show-brackets" : ""}`}
            >
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="min-h-40 p-4 outline-none" />
                }
                placeholder={
                  <div className="pointer-events-none absolute top-4 left-4 text-gray-400">
                    Start typing...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <ListPlugin />
              <ListBehaviorPlugin />
              <TabIndentationPlugin />
              <AutoFocusPlugin />
              <BlockquoteBehaviorPlugin
                exitOnEmptyLine={exitBlockquoteOnEmptyLine}
              />
              <MarkdownShortcutPlugin transformers={markdownTransformers} />
              <MarkdownPreviewPlugin onMarkdown={setMarkdownSource} />
            </div>
          </LexicalComposer>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1">Markdown source</p>
          <pre className="border border-gray-300 rounded-lg p-4 min-h-40 bg-gray-50 font-mono text-sm whitespace-pre-wrap overflow-auto">
            {markdownSource}
          </pre>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showMarkup}
            onChange={(e) => setShowMarkup(e.target.checked)}
            className="cursor-pointer"
          />
          Show markup
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={exitBlockquoteOnEmptyLine}
            onChange={(e) => setExitBlockquoteOnEmptyLine(e.target.checked)}
            className="cursor-pointer"
          />
          Exit blockquote on empty line
        </label>
      </div>
    </div>
  );
}

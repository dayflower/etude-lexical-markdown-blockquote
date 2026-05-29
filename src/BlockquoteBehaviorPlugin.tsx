import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
} from "lexical";
import { useEffect } from "react";
import { handleQuoteBackspace, handleQuoteEnter } from "./blockquoteBehavior";

type BlockquoteBehaviorPluginProps = {
  exitOnEmptyLine?: boolean;
};

export default function BlockquoteBehaviorPlugin({
  exitOnEmptyLine = false,
}: BlockquoteBehaviorPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => handleQuoteEnter(event, exitOnEmptyLine),
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, exitOnEmptyLine]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const handled = handleQuoteBackspace();

        if (handled) {
          event.preventDefault();
        }

        return handled;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}

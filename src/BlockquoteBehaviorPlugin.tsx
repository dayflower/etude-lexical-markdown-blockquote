import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createQuoteNode,
  $isQuoteNode,
  type QuoteNode,
} from "@lexical/rich-text";
import {
  $createParagraphNode,
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  type ElementNode,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  type LexicalNode,
} from "lexical";
import { useEffect } from "react";

type BlockquoteBehaviorPluginProps = {
  exitOnEmptyLine?: boolean;
};

function getSelectedQuoteNode(): QuoteNode | null {
  const selection = $getSelection();

  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }

  const topLevelElement = selection.anchor.getNode().getTopLevelElement();

  if (!$isQuoteNode(topLevelElement)) {
    return null;
  }

  return topLevelElement;
}

function getSelectedQuoteNodeAtStart(): QuoteNode | null {
  const selection = $getSelection();

  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  const topLevelElement = anchorNode.getTopLevelElement();

  if (!$isQuoteNode(topLevelElement)) {
    return null;
  }

  if (
    !isSelectionAtQuoteStart(
      selection.anchor.offset,
      anchorNode,
      topLevelElement,
    )
  ) {
    return null;
  }

  return topLevelElement;
}

function isSelectionAtQuoteStart(
  anchorOffset: number,
  anchorNode: LexicalNode,
  quoteNode: QuoteNode,
): boolean {
  if (anchorNode.is(quoteNode)) {
    return anchorOffset === 0;
  }

  if (anchorOffset !== 0) {
    return false;
  }

  return anchorNode.is(quoteNode.getFirstDescendant());
}

function replaceQuoteWithParagraph(quoteNode: QuoteNode): ElementNode {
  const paragraph = $createParagraphNode();
  paragraph.setDirection(quoteNode.getDirection());
  quoteNode.replace(paragraph, true);
  paragraph.selectStart();
  return paragraph;
}

function handleQuoteEnter(
  event: KeyboardEvent | null,
  exitOnEmptyLine: boolean,
): boolean {
  if (event?.shiftKey) {
    return false;
  }

  const selection = $getSelection();

  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return false;
  }

  if (getSelectedQuoteNode() === null) {
    return false;
  }

  event?.preventDefault();

  if (exitOnEmptyLine && breakQuoteAtEmptyLine()) {
    return true;
  }

  selection.insertLineBreak(false);
  return true;
}

function handleQuoteBackspace(): boolean {
  if (breakQuoteAtEmptyLine()) {
    return true;
  }

  const quoteNode = getSelectedQuoteNodeAtStart();

  if (quoteNode === null) {
    return false;
  }

  const previousSibling = quoteNode.getPreviousSibling();

  if (!$isQuoteNode(previousSibling)) {
    replaceQuoteWithParagraph(quoteNode);
    return true;
  }

  if (quoteNode.isEmpty()) {
    replaceQuoteWithParagraph(quoteNode);
    return true;
  }

  previousSibling.selectEnd();
  previousSibling.append(...quoteNode.getChildren());
  quoteNode.remove();
  return true;
}

function breakQuoteAtEmptyLine(): boolean {
  const selection = $getSelection();

  if (
    !$isRangeSelection(selection) ||
    !selection.isCollapsed() ||
    selection.anchor.type !== "element"
  ) {
    return false;
  }

  const quoteNode = selection.anchor.getNode();

  if (!$isQuoteNode(quoteNode)) {
    return false;
  }

  const previousChild = quoteNode.getChildAtIndex(selection.anchor.offset - 1);
  const nextChild = quoteNode.getChildAtIndex(selection.anchor.offset);

  if (
    !$isLineBreakNode(previousChild) ||
    (nextChild !== null && !$isLineBreakNode(nextChild))
  ) {
    return false;
  }

  previousChild.remove();

  const paragraph = $createParagraphNode();
  paragraph.setDirection(quoteNode.getDirection());
  quoteNode.insertAfter(paragraph);

  if ($isLineBreakNode(nextChild)) {
    const trailingChildren = nextChild.getNextSiblings();
    const trailingQuoteNode = $createQuoteNode();
    trailingQuoteNode.setDirection(quoteNode.getDirection());
    nextChild.remove();

    if (trailingChildren.length > 0) {
      trailingQuoteNode.append(...trailingChildren);
      paragraph.insertAfter(trailingQuoteNode);
    }
  }

  paragraph.selectStart();
  return true;
}

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

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
  type ElementNode,
  type LexicalNode,
  type RangeSelection,
} from "lexical";

type QuoteSelectionContext = {
  anchorNode: LexicalNode;
  quoteNode: QuoteNode;
  selection: RangeSelection;
};

function getCollapsedQuoteSelection(): QuoteSelectionContext | null {
  const selection = $getSelection();

  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  const topLevelElement = anchorNode.getTopLevelElement();

  if (!$isQuoteNode(topLevelElement)) {
    return null;
  }

  return {
    anchorNode,
    quoteNode: topLevelElement,
    selection,
  };
}

function getQuoteSelectionAtStart(): QuoteSelectionContext | null {
  const context = getCollapsedQuoteSelection();

  if (
    context === null ||
    !isSelectionAtQuoteStart(
      context.selection.anchor.offset,
      context.anchorNode,
      context.quoteNode,
    )
  ) {
    return null;
  }

  return context;
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

export function handleQuoteEnter(
  event: KeyboardEvent | null,
  exitOnEmptyLine: boolean,
): boolean {
  if (event?.shiftKey) {
    return false;
  }

  const context = getCollapsedQuoteSelection();

  if (context === null) {
    return false;
  }

  event?.preventDefault();

  if (exitOnEmptyLine && exitQuoteAtBlankLine()) {
    return true;
  }

  context.selection.insertLineBreak(false);
  return true;
}

export function handleQuoteBackspace(): boolean {
  if (exitQuoteAtBlankLine()) {
    return true;
  }

  const context = getQuoteSelectionAtStart();

  if (context === null) {
    return false;
  }

  const { quoteNode } = context;
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

function exitQuoteAtBlankLine(): boolean {
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
  moveTrailingQuoteContentAfterParagraph(quoteNode, paragraph, nextChild);

  paragraph.selectStart();
  return true;
}

function moveTrailingQuoteContentAfterParagraph(
  sourceQuoteNode: QuoteNode,
  paragraph: ElementNode,
  nextChild: LexicalNode | null,
) {
  if (!$isLineBreakNode(nextChild)) {
    return;
  }

  const trailingChildren = nextChild.getNextSiblings();
  const trailingQuoteNode = $createQuoteNode();
  trailingQuoteNode.setDirection(sourceQuoteNode.getDirection());
  nextChild.remove();

  if (trailingChildren.length === 0) {
    return;
  }

  trailingQuoteNode.append(...trailingChildren);
  paragraph.insertAfter(trailingQuoteNode);
}

import { getChildNodeByIndex } from "./DOMTools";

export type SelectionAdj = {
    startNode: Node,
    startOffset: number,
    endNode: Node,
    endOffset: number,
    commonNode: Node,
    rootNode?: Node,
    startIndex?: number,
    endIndex?: number
};


export function restoreSelection(nd: Node, startIndex: number, endIndex: number): void {
    let sel = window.getSelection();
    const startNd = getChildNodeByIndex(nd, startIndex);
    const endNd = getChildNodeByIndex(nd, endIndex);

    const selRange = document.createRange();
    selRange.setStart(startNd.node, startNd.offset);
    selRange.setEnd(endNd.node, endNd.offset);
    sel?.removeAllRanges();
    sel?.addRange(selRange);
}
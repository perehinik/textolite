import { getChildNodeByIndex } from "./DOMTools";

export type SelectionAdj = {
    startNode: Node,
    startOffset: number,
    endNode: Node,
    endOffset: number,
    commonNode: Node,
    rootNode?: Node,
    startIndex?: number,
    endIndex?: number,
    isEmpty: boolean
};


export function restoreSelection(nd: Node, startIndex: number, endIndex: number): void {
    let sel = window.getSelection();
    const startNd = getChildNodeByIndex(nd, startIndex);
    const endNd = getChildNodeByIndex(nd, endIndex);
    if (endNd.offset === 0) {
        const prevSibl = getPreviousSiblingWithText(endNd.node);
        if (prevSibl) {
            const txtNode = getRightMostTextNode(prevSibl);
            if (txtNode?.textContent) {
                endNd.node = txtNode;
                endNd.offset = txtNode.textContent.length
            }
        }
    }

    console.log("=>", startNd.node, startNd.offset, endNd.node, endNd.offset)

    const selRange = document.createRange();
    selRange.setStart(startNd.node, startNd.offset);
    selRange.setEnd(endNd.node, endNd.offset);
    sel?.removeAllRanges();
    sel?.addRange(selRange);
}

// This fixes situation when selection ends with index 0.
// In this case selection end is replaced with the end of previous text node.
export function fixSelectionEnd(sel: SelectionAdj): SelectionAdj {
    if (sel.endOffset !== 0) {return sel;}
    const prevSibl = getPreviousSiblingWithText(sel.endNode);
    if (!prevSibl) {return sel;}
    const txtNode = getRightMostTextNode(prevSibl);
    if (!txtNode || !txtNode.textContent) {return sel;}
    sel.endNode = txtNode;
    sel.endOffset = txtNode.textContent.length;
    return sel;
}

function getPreviousSiblingWithText(nd: Node): Node | undefined {
    while (nd.previousSibling) {
        nd = nd.previousSibling;
        if (nd.textContent && nd.textContent.length > 0) {return nd;}
    }
    if (!nd.parentNode) {return;}
    return getPreviousSiblingWithText(nd.parentNode);
}

function getRightMostTextNode(nd: Node): Node | undefined {
    if (nd.nodeType === Node.TEXT_NODE) {return nd;}
    for (let i = nd.childNodes.length-1; i>=0; i--) {
        const chNd = nd.childNodes[i];
        if (chNd.textContent && chNd.textContent.length > 0) {
            return getRightMostTextNode(chNd);
        }
    }
}
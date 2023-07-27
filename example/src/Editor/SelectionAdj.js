"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixSelectionEnd = exports.restoreSelection = void 0;
const DOMTools_1 = require("./DOMTools");
function restoreSelection(nd, startIndex, endIndex) {
    let sel = window.getSelection();
    const startNd = (0, DOMTools_1.getChildNodeByIndex)(nd, startIndex);
    const endNd = (0, DOMTools_1.getChildNodeByIndex)(nd, endIndex);
    console.log("=>", startNd.node, startNd.offset, endNd.node, endNd.offset);
    const selRange = document.createRange();
    selRange.setStart(startNd.node, startNd.offset);
    selRange.setEnd(endNd.node, endNd.offset);
    sel?.removeAllRanges();
    sel?.addRange(selRange);
}
exports.restoreSelection = restoreSelection;
// This fixes situation when selection ends with index 0.
// In this case selection end is replaced with the end of previous text node.
function fixSelectionEnd(sel) {
    if (sel.endOffset !== 0) {
        return sel;
    }
    const prevSibl = getPreviousSiblingWithText(sel.endNode);
    if (!prevSibl) {
        return sel;
    }
    const txtNode = getRightMostTextNode(prevSibl);
    if (!txtNode || !txtNode.textContent) {
        return sel;
    }
    sel.endNode = txtNode;
    sel.endOffset = txtNode.textContent.length;
    return sel;
}
exports.fixSelectionEnd = fixSelectionEnd;
function getPreviousSiblingWithText(nd) {
    while (nd.previousSibling) {
        nd = nd.previousSibling;
        if (nd.textContent && nd.textContent.length > 0) {
            return nd;
        }
    }
    if (!nd.parentNode) {
        return;
    }
    return getPreviousSiblingWithText(nd.parentNode);
}
function getRightMostTextNode(nd) {
    if (nd.nodeType === Node.TEXT_NODE) {
        return nd;
    }
    for (let i = nd.childNodes.length - 1; i >= 0; i--) {
        const chNd = nd.childNodes[i];
        if (chNd.textContent && chNd.textContent.length > 0) {
            return getRightMostTextNode(chNd);
        }
    }
}

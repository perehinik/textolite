"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreSelection = void 0;
const DOMTools_1 = require("./DOMTools");
function restoreSelection(nd, startIndex, endIndex) {
    let sel = window.getSelection();
    const startNd = (0, DOMTools_1.getChildNodeByIndex)(nd, startIndex);
    const endNd = (0, DOMTools_1.getChildNodeByIndex)(nd, endIndex);
    const selRange = document.createRange();
    selRange.setStart(startNd.node, startNd.offset);
    selRange.setEnd(endNd.node, endNd.offset);
    sel?.removeAllRanges();
    sel?.addRange(selRange);
}
exports.restoreSelection = restoreSelection;

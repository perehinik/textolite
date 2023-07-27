"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimyzeNode = void 0;
const Styling_1 = require("./Styling");
/*
DOM optimization by style.

Removes child nodes with same stayle as parent's.
1. Compare style for all childen nodes with parent node's style. Start from left to right.
2. If there are more then one child node with same style as node - concatenate them into text node.
3. If parent node contains only 1 node with style(not text) - move applied styles and text
    from child to parent, remove child.
4. If all child nodes have same style as parent ->

Same logic shoul be applied from deapest node to target node(depth first.)
*/
// returns replacement node for provided node or nothing.
function optimyzeNode(nd, parentStyle) {
    // if it's a leaf
    if (nd.nodeType === Node.TEXT_NODE) {
        return nd;
    }
    if (nd.childNodes.length === 0) {
        return;
    }
    let optimizationRezult = nd.cloneNode();
    let segmentText = "";
    let segmentType = "TEXT";
    let segmentStyle = {};
    const ndStyle = (0, Styling_1.getStyle)(nd);
    for (let childId = 0; childId < nd.childNodes.length; childId++) {
        const childNd = nd.childNodes[childId]; // as HTMLElement;
        if (childNd.nodeName === "BR") {
            segmentText += "<br/>";
            continue;
        }
        if (!childNd.textContent) {
            continue;
        }
        // This can return text node(concatenated) if style of childNd and all it's children
        // is the same as childNd.parentNode
        // Otherwise it should return nothing or modified copy of childNd.
        const chNdReplace = optimyzeNode(childNd, (0, Styling_1.applyOverlappingStyle)(parentStyle, ndStyle));
        const chNdReplaceStyle = (0, Styling_1.getStyle)(chNdReplace);
        const nodeType = chNdReplace?.nodeType === Node.TEXT_NODE ? "TEXT" : chNdReplace?.nodeName;
        //console.log(nodeType, childNd.textContent, chNdReplaceStyle, segmentType, segmentStyle)
        // This should be removed in order to implement other node types.
        if (nodeType !== "TEXT" && nodeType !== "SPAN" && nodeType !== "P") {
            continue;
        }
        // Node contains more than 1 child so can't be optimized
        if (chNdReplace?.childNodes?.length && chNdReplace.childNodes.length > 1) {
            addChild(optimizationRezult, segmentType, segmentText, segmentStyle);
            if (sameChilderStyle(chNdReplace) && (0, Styling_1.compareNodeStyles)(segmentStyle, chNdReplaceStyle)) {
                for (let i = 0; i < chNdReplace.childNodes.length; i++) {
                    optimizationRezult.appendChild(chNdReplace.childNodes[i]);
                }
            }
            else {
                optimizationRezult.appendChild(chNdReplace);
            }
            segmentText = "";
            segmentType = "TEXT";
            segmentStyle = {};
        }
        // Node has same style as previous sibling so can be merged with it.
        else if (nodeType === segmentType && (0, Styling_1.compareNodeStyles)(segmentStyle, chNdReplaceStyle)) {
            segmentText += childNd.textContent;
            continue;
            // Node is different from previous sibling so new segment should be started.
        }
        else {
            addChild(optimizationRezult, segmentType, segmentText, segmentStyle);
            segmentText = childNd.textContent;
            segmentType = nodeType ? nodeType : "";
            segmentStyle = chNdReplaceStyle;
        }
    }
    // No nested SPANs, just text
    if (!optimizationRezult.childNodes.length) {
        if (nd.parentNode && (0, Styling_1.compareChildStyle)(parentStyle, ndStyle) || segmentText === "") {
            return document.createTextNode(segmentText);
        }
        else {
            optimizationRezult.innerHTML = segmentText;
            for (let styleName in segmentStyle) {
                optimizationRezult.style.setProperty(styleName, segmentStyle[styleName]);
            }
        }
        // There are nested SPANs and some text at the end.
    }
    else {
        addChild(optimizationRezult, segmentType, segmentText, segmentStyle);
    }
    return optimizationRezult;
}
exports.optimyzeNode = optimyzeNode;
function sameChilderStyle(nd) {
    for (let childId = 0; childId < nd.childNodes.length; childId++) {
        if (nd.childNodes[childId].nodeType !== Node.TEXT_NODE && nd.childNodes[childId].nodeName != "BR") {
            return false;
        }
    }
    return true;
}
function addChild(pNd, chNdType, textContent, style) {
    if (!textContent) {
        return;
    }
    chNdType = chNdType ? chNdType : "TEXT";
    style = style ? style : {};
    if (chNdType === "TEXT") {
        pNd.innerHTML += textContent; //appendChild(document.createTextNode(textContent));
    }
    else {
        const ndNew = document.createElement(chNdType);
        ndNew.innerHTML = textContent;
        for (let styleName in style) {
            ndNew.style.setProperty(styleName, style[styleName]);
        }
        pNd.appendChild(ndNew);
    }
}

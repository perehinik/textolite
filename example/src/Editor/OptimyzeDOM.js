"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimyzeNode = void 0;
// returns replacement node for provided node or nothing.
function optimyzeNode(nd, parentStyle) {
    // if it's a leaf
    if (nd.childNodes.length === 0) {
        return;
    }
    let optimizationRezult = nd.cloneNode();
    let segmentText = "";
    const ndStyle = getStyle(nd);
    for (let childId = 0; childId < nd.childNodes.length; childId++) {
        const childNd = nd.childNodes[childId]; // as HTMLElement;
        // No need to modify anything for now
        if (childNd.nodeType === Node.TEXT_NODE) {
            segmentText += childNd.textContent;
            continue;
        }
        // This can return text node(concatenated) if style of childNd and all it's children
        // is the same as childNd.parentNode
        // Otherwise it should return nothing or or modified copy of childNd.
        const childNodeReplace = optimyzeNode(childNd, concatStyles(parentStyle, ndStyle));
        // If replacement node is TEXT then style is the same.
        if (childNodeReplace?.nodeType === Node.TEXT_NODE) {
            segmentText += childNd.textContent;
            continue;
        }
        // If return node is SPAN
        // then we need to create the copy of nd, modify it and return.
        // so DOM will be updated only at the root nd node.
        if (childNodeReplace?.nodeName === "SPAN") {
            if (segmentText !== "") {
                optimizationRezult.appendChild(document.createTextNode(segmentText));
                segmentText = "";
            }
            optimizationRezult.appendChild(childNodeReplace);
        }
    }
    // No nested SPANs, just text
    if (!optimizationRezult.childNodes.length) {
        if (nd.parentNode && compareNodeStyles(parentStyle, ndStyle) || segmentText === "") {
            return document.createTextNode(segmentText);
        }
        else {
            optimizationRezult.textContent = segmentText;
        }
        // There are nested SPANs and some text at the end.
    }
    else if (segmentText !== "") {
        optimizationRezult.appendChild(document.createTextNode(segmentText));
    }
    return optimizationRezult;
}
exports.optimyzeNode = optimyzeNode;
function getStyle(nd) {
    const ndStyle = {};
    if (nd?.style?.length) {
        for (let styleId = 0; styleId < nd.style.length; styleId++) {
            const stylePropName = nd.style[styleId];
            ndStyle[stylePropName] = nd.style.getPropertyValue(stylePropName);
        }
    }
    return ndStyle;
}
function concatStyles(parentStyle, childStyle) {
    const chNdStyle = { ...parentStyle };
    if (childStyle) {
        for (let styleName in childStyle) {
            chNdStyle[styleName] = childStyle[styleName];
        }
    }
    return chNdStyle;
}
function compareNodeStyles(parentStyle, childStyle) {
    if (!parentStyle && childStyle) {
        return false;
    }
    for (let cssName in childStyle) {
        if (parentStyle && parentStyle[cssName] !== childStyle[cssName]) {
            return false;
        }
    }
    return true;
}

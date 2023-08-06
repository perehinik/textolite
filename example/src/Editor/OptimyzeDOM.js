"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeNodeList = exports.optimyzeNode = void 0;
const Styling_1 = require("./Styling");
/*
DOM optimization by style.

Removes child nodes with same style as parent's.
1. Compare style for all childen nodes with parent node's style. Start from left to right.
2. If there are more then one child node with same style as node - concatenate them into text node.
3. If parent node contains only 1 node with style(not text) - move applied styles and text
    from child to parent, remove child.
4. If all child nodes have same style as parent ->

Same logic shoul be applied from deapest node to target node(depth first.)
*/
// vertical optimization
function optimyzeNode(nd, parentStyle) {
    if (nd.nodeType === Node.TEXT_NODE) {
        return nd.cloneNode();
    }
    if (nd.nodeName === "BR") {
        return nd.cloneNode();
    }
    if (nd.childNodes.length === 0) {
        return;
    }
    const ndStyle = (0, Styling_1.getStyle)(nd);
    const ndStyleAbs = (0, Styling_1.applyOverlappingStyle)(parentStyle, ndStyle);
    let res = [];
    for (let childId = 0; childId < nd.childNodes.length; childId++) {
        const childNd = nd.childNodes[childId];
        // This can return text node(concatenated) if style of childNd and all it's children
        // is the same as childNd.parentNode
        // Otherwise it should return nothing or modified copy of childNd.
        const chNdReplace = optimyzeNode(childNd, ndStyleAbs);
        if (!chNdReplace) {
            continue;
        }
        const chNdReplaceStyle = (0, Styling_1.getStyle)(chNdReplace);
        const nodeType = chNdReplace?.nodeType === Node.TEXT_NODE ? "TEXT" : chNdReplace?.nodeName;
        if (chNdReplace.nodeName === "BR" || chNdReplace.nodeType === Node.TEXT_NODE) {
            res.push(chNdReplace);
            continue;
        }
        // This should be removed in order to implement other node types.
        if (nodeType !== "SPAN" && nodeType !== "P") {
            continue;
        }
        // Style is the same so we can extract all nodes from inside.
        if ((0, Styling_1.compareChildStyle)(ndStyleAbs, chNdReplaceStyle)) {
            for (let i = 0; i < chNdReplace.childNodes.length; i++) {
                res.push(chNdReplace.childNodes[i]);
            }
            // Style is different so just push the whole node.
        }
        else {
            res.push(chNdReplace);
        }
    }
    // Optimyze node list horizontally
    res = optimizeNodeList(res);
    if (res.length === 0) {
        return;
    }
    else if (res.length === 1) {
        if (res[0].nodeName === "BR") {
            return res[0];
        }
        const resStyle = (0, Styling_1.getStyle)(res[0]);
        const resNd = nd.cloneNode();
        if (res[0].nodeName === "SPAN") {
            while (res[0].childNodes.length > 0) {
                resNd.appendChild(res[0].childNodes[0]);
            }
        }
        else {
            resNd.appendChild(res[0]);
        }
        if (resNd.style != undefined) {
            for (let key in resStyle) {
                resNd.style.setProperty(key, resStyle[key]);
            }
        }
        return resNd;
    }
    const resNd = nd.cloneNode();
    for (let i = 0; i < res.length; i++) {
        resNd.appendChild(res[i]);
    }
    return resNd;
}
exports.optimyzeNode = optimyzeNode;
function optimizeNodeList(ndList) {
    const res = [];
    for (let i = 0; i < ndList.length; i++) {
        if (!ndList[i]?.nodeName) {
            continue;
        }
        ;
        if (i === 0) {
            res.push(ndList[i]);
            continue;
        }
        const lastAddedNode = res[res.length - 1];
        if (ndList[i]?.nodeName === "BR" && lastAddedNode?.nodeName === "SPAN") {
            lastAddedNode.appendChild(ndList[i]);
            continue;
        }
        if (lastAddedNode?.nodeType === Node.TEXT_NODE && ndList[i]?.nodeType === Node.TEXT_NODE) {
            if (lastAddedNode?.textContent != null && ndList[i].textContent != null) {
                lastAddedNode.textContent += ndList[i].textContent;
            }
            continue;
        }
        if (lastAddedNode?.nodeName !== ndList[i]?.nodeName) {
            res.push(ndList[i]);
            continue;
        }
        const ndStyle1 = (0, Styling_1.getStyle)(lastAddedNode);
        const ndStyle2 = (0, Styling_1.getStyle)(ndList[i]);
        if ((0, Styling_1.compareNodeStyles)(ndStyle1, ndStyle2) && ndList[i]?.childNodes?.length) {
            while (ndList[i]?.childNodes?.length) {
                const chNd = ndList[i].childNodes[0];
                lastAddedNode.appendChild(chNd);
            }
            continue;
        }
        res.push(ndList[i]);
    }
    return res;
}
exports.optimizeNodeList = optimizeNodeList;
function sameChildrenStyle(nd) {
    for (let childId = 0; childId < nd.childNodes.length; childId++) {
        if (nd.childNodes[childId].nodeType !== Node.TEXT_NODE && nd.childNodes[childId].nodeName !== "BR") {
            return false;
        }
    }
    return true;
}
function addChild(pNd, chNdType, textContent, style) {
    console.log("add content", chNdType, textContent);
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

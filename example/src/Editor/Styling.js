"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareNodeStyles = exports.compareChildStyle = exports.concatStyles = exports.setStyle = exports.getNestedStyle = exports.getStyle = void 0;
const OptimyzeDOM_1 = require("./OptimyzeDOM");
const SelectionAdj_1 = require("./SelectionAdj");
// Returns style of single object, without children.
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
exports.getStyle = getStyle;
// Returns style of specified node and all children.
// If for some property there are multiple styles - returns '-\!/-'
function getNestedStyle(sel) {
    const style = {};
    return style;
}
exports.getNestedStyle = getNestedStyle;
// If child node has text type then it uses parent node style
function getParentStyle(nd) {
    return getStyle(nd.parentNode);
}
function* ndChildrenIter(nd) {
    if (!nd.childNodes.length) {
        return;
    }
    for (let i = 0; i < nd.childNodes.length; i++) {
        // yiels children
        yield nd.childNodes[i];
        const ndGen = ndChildrenIter(nd.childNodes[i]);
        let chNd = ndGen.next();
        // yield children recursively
        while (chNd.value) {
            yield chNd.value;
            chNd = ndGen.next();
        }
    }
}
/*
Iterate through all nodes starting from node which starts range.
Omit all nodes on the left side from that node.
*/
function* rangeStartIter(sel) {
    const rootNode = sel.rootNode;
    let currentNode = sel.startNode;
    if (!currentNode) {
        return sel.startNode;
    }
    let prevNode = currentNode;
    yield currentNode;
    do {
        if (currentNode.nextSibling) {
            if (currentNode?.parentNode?.isSameNode(sel.commonNode)) {
                return;
            }
            yield currentNode;
            const ndGen = ndChildrenIter(currentNode);
            let chNd = ndGen.next();
            // yield children recursively
            while (chNd.value) {
                yield chNd.value;
                chNd = ndGen.next();
            }
        }
        else {
            prevNode = currentNode;
            currentNode = currentNode.parentNode;
        }
    } while (currentNode && !currentNode.isSameNode(sel.commonNode) && (!rootNode || !currentNode.isSameNode(rootNode)));
}
function setStyle(sel, style) {
    let rootP = document.getElementById("txt-root");
    // If start and end nendNodeode are the same - selection in one node.
    if (sel.startNode.isSameNode(sel.endNode)) {
        updateNodeStyle(sel.startNode, style);
        return;
    }
    const rootAnchor = setStyleFromStart(sel, style);
    const rootFocus = setStyleFromEnd(sel, style);
    let node = rootAnchor?.nextSibling;
    while (node && !node.isSameNode(rootFocus)) {
        updateNodeStyle(node, style);
        resetChildrenStyle(node);
        node = node.nextSibling;
    }
    // Optimize DOM structure after style update
    const nodeReplacement = rootP ? (0, OptimyzeDOM_1.optimyzeNode)(rootP) : null;
    if (rootP && nodeReplacement) {
        rootP.parentNode?.replaceChild(nodeReplacement, rootP);
    }
    // Because DOM structure may have been changed we need to update selection range
    (0, SelectionAdj_1.restoreSelection)(nodeReplacement, sel.startIndex ? sel.startIndex : 0, sel.endIndex ? sel.endIndex : 0);
}
exports.setStyle = setStyle;
function updateNodeStyle(nd, newStyle) {
    const el = nd;
    // If node has style property then style can be changed directly
    if (el.style) {
        for (let key in newStyle) {
            el.style.setProperty(key, newStyle[key]);
        }
    }
    // Case when target node is the text node and it's the only node in parent node.
    // In this case it should be safe to change parent style.
    else if (nd.parentNode?.childNodes.length === 1 && nd.parentNode?.style) {
        updateNodeStyle(nd.parentNode, newStyle);
        // Case when target node is the text node but it's NOT the only node in parent node.
        // So text node should be replaces with span in order to set style of this part of text.
    }
    else {
        const ndSpan = document.createElement("span");
        ndSpan.textContent = nd.textContent;
        updateNodeStyle(ndSpan, newStyle);
        nd.parentNode?.replaceChild(ndSpan, nd);
        return ndSpan;
    }
    return nd;
}
function resetChildrenStyle(nd) {
    nd.childNodes.forEach(ndChild => {
        const el = ndChild;
        if (el.style) {
            el.style.fontWeight = "";
        }
        resetChildrenStyle(ndChild);
    });
}
function setStyleFromStart(sel, newStyle) {
    const rootNode = sel.rootNode;
    let currentNode = sel.startNode;
    if (!currentNode) {
        return sel.startNode;
    }
    let prevNode = currentNode;
    currentNode = updateNodeStyle(currentNode, newStyle);
    do {
        if (currentNode.nextSibling) {
            if (currentNode?.parentNode?.isSameNode(sel.commonNode)) {
                return currentNode;
            }
            currentNode = currentNode.nextSibling;
            currentNode = updateNodeStyle(currentNode, newStyle);
            resetChildrenStyle(currentNode);
        }
        else {
            prevNode = currentNode;
            currentNode = currentNode.parentNode;
        }
    } while (currentNode && !currentNode.isSameNode(sel.commonNode) && (!rootNode || !currentNode.isSameNode(rootNode)));
    return prevNode;
}
function setStyleFromEnd(sel, newStyle) {
    const rootNode = sel.rootNode;
    let currentNode = sel.endNode;
    if (!currentNode) {
        return sel.endNode;
    }
    let prevNode = currentNode;
    currentNode = updateNodeStyle(currentNode, newStyle);
    do {
        if (currentNode.previousSibling) {
            if (currentNode?.parentNode?.isSameNode(sel.commonNode)) {
                return currentNode;
            }
            currentNode = currentNode.previousSibling;
            currentNode = updateNodeStyle(currentNode, newStyle);
            resetChildrenStyle(currentNode);
        }
        else {
            prevNode = currentNode;
            currentNode = currentNode.parentNode;
        }
    } while (currentNode && !currentNode.isSameNode(sel.commonNode) && (!rootNode || !currentNode.isSameNode(rootNode)));
    return prevNode;
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
exports.concatStyles = concatStyles;
function compareChildStyle(parentStyle, childStyle) {
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
exports.compareChildStyle = compareChildStyle;
function compareNodeStyles(Style1, Style2) {
    if (Object.keys(Style1).length !== Object.keys(Style2).length) {
        return false;
    }
    for (let cssName in Style1) {
        if (Style1[cssName] !== Style2[cssName]) {
            return false;
        }
    }
    return true;
}
exports.compareNodeStyles = compareNodeStyles;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareNodeStyles = exports.compareChildStyle = exports.applyOverlappingStyle = exports.updateNodeStyle = exports.setStyle = exports.getNestedStyle = exports.getStyleFromRoot = exports.getStyle = exports.defaultStyle = void 0;
const OptimyzeDOM_1 = require("./OptimyzeDOM");
const SelectionAdj_1 = require("./SelectionAdj");
const DOMTools_1 = require("./DOMTools");
exports.defaultStyle = {
    'font-weight': 'normal',
    'font-style': 'normal',
    'text-decoration': 'none'
};
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
// Returns node style with consideration of styles of all parent nodes.
function getStyleFromRoot(nd) {
    const ndHierarchy = (0, DOMTools_1.getNodeHierarchy)(nd, document.body);
    let ndStyle = {};
    ndHierarchy.forEach((item) => {
        const chStyle = getStyle(item);
        ndStyle = applyOverlappingStyle(ndStyle, chStyle);
    });
    return ndStyle;
}
exports.getStyleFromRoot = getStyleFromRoot;
function combineNestedStyles(style1, style2) {
    const res = { ...style1 };
    if (!style2) {
        return res;
    }
    for (let key in style2) {
        if (!Object.keys(style1).includes(key) || style1[key] !== style2[key]) {
            res[key] = '*x*';
        }
    }
    for (let key in style1) {
        if (!Object.keys(style2).includes(key)) {
            res[key] = '*x*';
        }
    }
    return res;
}
// Returns nested style for specified node.
// CSSObj -> initial style.
// limitList -> nodeHierarchy with nodes which are limiting nodes range.
// startLimited -> if true = styles are collectred only after spotting node which is in limitList
// endLimited -> if true = styles are not collectred after spotting node which is in limitList
function getNodeNestedStyle(nd, style, limitListStart, limitListEnd, startLimited, endLimited) {
    if (nd.nodeType === Node.TEXT_NODE) {
        return style;
    } // end of recursion
    if (!nd.childNodes) {
        return;
    }
    const ndStyle = applyOverlappingStyle(style, getStyle(nd));
    let result = undefined;
    let startFound = !startLimited;
    for (let ndI = 0; ndI < nd.childNodes.length; ndI++) {
        const chNd = nd.childNodes[ndI];
        const thisIsEndNode = endLimited && startFound && limitListEnd.includes(chNd);
        let chStyle = undefined;
        if (startFound) {
            chStyle = getNodeNestedStyle(chNd, ndStyle, limitListStart, limitListEnd, false, thisIsEndNode);
        }
        else if (limitListStart.includes(chNd)) {
            // No need to check if start is limited, if it went here - start is limited.
            startFound = true;
            chStyle = getNodeNestedStyle(chNd, ndStyle, limitListStart, limitListEnd, true, false);
        }
        if (chStyle) {
            result = combineNestedStyles(chStyle, result);
        }
        if (thisIsEndNode) {
            break;
        }
    }
    return result;
}
// Returns style of specified node and all children.
// If for some property there are multiple styles - returns '*x*'
function getNestedStyle(sel) {
    const commonNodeStyle = getStyleFromRoot(sel.commonNode);
    if (sel.isEmpty) {
        const chStyle = getStyle(sel.startNode);
        return applyOverlappingStyle(commonNodeStyle, chStyle);
    }
    const startHierarchy = (0, DOMTools_1.getNodeHierarchy)(sel.startNode, sel.commonNode);
    const endHierarchy = (0, DOMTools_1.getNodeHierarchy)(sel.endNode, sel.commonNode);
    const limitList = startHierarchy.concat(endHierarchy);
    const style = getNodeNestedStyle(sel.commonNode, commonNodeStyle, startHierarchy, endHierarchy, true, true);
    return style ? style : commonNodeStyle;
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
    console.log("setstyle selection", sel);
    // If start and end nendNodeode are the same - selection in one node.
    if (sel.startNode.isSameNode(sel.endNode)) {
        updateNodeStyle(sel.startNode, style);
        (0, SelectionAdj_1.restoreSelection)(sel.startNode, sel.startOffset, sel.endOffset);
        return;
    }
    const rootAnchor = setStyleFromStart(sel, style);
    const rootFocus = setStyleFromEnd(sel, style);
    console.log("ra:", rootAnchor?.textContent, "rf:", rootFocus?.textContent);
    let node = rootAnchor?.nextSibling;
    while (node && !node.isSameNode(rootFocus)) {
        console.log("middle:", node.textContent);
        node = updateNodeStyle(node, style);
        resetChildrenStyle(node, style);
        node = node.nextSibling;
    }
    // Optimize DOM structure after style update
    //ToDo IP: this can be upgraded to optimyze only modified nodes, not the whoile editor tree.
    const nodeReplacement = rootP ? (0, OptimyzeDOM_1.optimyzeNode)(rootP, exports.defaultStyle) : null;
    if (rootP && rootP.parentNode && nodeReplacement) {
        rootP.parentNode.replaceChild(nodeReplacement, rootP);
    }
    // Because DOM structure may have been changed we need to update selection range
    (0, SelectionAdj_1.restoreSelection)(nodeReplacement, sel.startIndex ? sel.startIndex : 0, sel.endIndex ? sel.endIndex : 0);
}
exports.setStyle = setStyle;
function updateNodeStyle(nd, newStyle) {
    if (nd.nodeName == "BR") {
        return nd;
    }
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
    else if (nd.nodeType === Node.TEXT_NODE) {
        const ndSpan = document.createElement("span");
        ndSpan.textContent = nd.textContent;
        updateNodeStyle(ndSpan, newStyle);
        nd.parentNode?.replaceChild(ndSpan, nd);
        return ndSpan;
    }
    return nd;
}
exports.updateNodeStyle = updateNodeStyle;
function resetChildrenStyle(nd, newStyle) {
    nd.childNodes.forEach(ndChild => {
        const el = ndChild;
        if (el.style) {
            for (let key in newStyle) {
                el.style.setProperty(key, "");
            }
        }
        resetChildrenStyle(ndChild, newStyle);
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
            resetChildrenStyle(currentNode, newStyle);
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
            resetChildrenStyle(currentNode, newStyle);
        }
        else {
            prevNode = currentNode;
            currentNode = currentNode.parentNode;
        }
    } while (currentNode && !currentNode.isSameNode(sel.commonNode) && (!rootNode || !currentNode.isSameNode(rootNode)));
    return prevNode;
}
function applyOverlappingStyle(parentStyle, childStyle) {
    if (!parentStyle) {
        return { ...childStyle };
    }
    ;
    const chNdStyle = { ...parentStyle };
    if (childStyle) {
        for (let styleName in childStyle) {
            chNdStyle[styleName] = childStyle[styleName];
        }
    }
    return chNdStyle;
}
exports.applyOverlappingStyle = applyOverlappingStyle;
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

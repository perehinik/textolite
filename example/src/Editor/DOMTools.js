"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommonNode = exports.getNodeHierarchy = exports.getChildNodeByIndex = void 0;
function getChildNodeByIndex(nd, index) {
    if (nd.childNodes?.length) {
        for (let i = 0; i < nd.childNodes.length; i++) {
            const chNd = nd.childNodes[i];
            const txtLength = chNd?.textContent?.length;
            if (!txtLength) {
                continue;
            }
            // Second condition is to eliminate situation when start position
            // is at the end of the node. In this case selection should start at the next node. 
            if (index < txtLength || (i + 1 === nd.childNodes.length && index === txtLength)) {
                return getChildNodeByIndex(chNd, index);
            }
            index -= txtLength;
        }
    }
    return { node: nd, offset: index };
}
exports.getChildNodeByIndex = getChildNodeByIndex;
// Returns node chain from specified node to root node. 
function getNodeHierarchy(nd, rootNode) {
    let nodeHierarchy = [nd];
    while (nd.parentNode && !nd.isSameNode(rootNode)) {
        nd = nd.parentNode;
        nodeHierarchy.push(nd);
    }
    return nodeHierarchy.reverse();
}
exports.getNodeHierarchy = getNodeHierarchy;
// Get node where hierarchies split.
function getCommonNode(startHierarchy, endHierarchy) {
    const maxDepth = Math.min(startHierarchy.length, endHierarchy.length);
    for (let depth = 1; depth < maxDepth; depth++) {
        if (!startHierarchy[depth].isSameNode(endHierarchy[depth])) {
            return startHierarchy[depth - 1];
        }
    }
    return startHierarchy[maxDepth - 1];
}
exports.getCommonNode = getCommonNode;

/**
 * @module DOMTools - Module contains tools for working with DOM.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

/**
 * Describes position in DOM. 
 *
 * @param node - The node which contains position.
 * @param offset - Offset from start of specified node
 */
export type Position = {
    node: Node,
    offset: number
};

/**
 * Returns position with node and offset corresponding to `offset` from `nd`. 
 *
 * @param nd - Root node.
 * @param index - Offset from the begininbg of the node.
 * @returns Position object with child node corresponding specified offset.
 */
export function getChildNodeByIndex(nd: Node, index: number): Position {
    let res: Position = {node: nd, offset: index};
    if (nd.childNodes?.length) {
        for (let i=0; i < nd.childNodes.length; i++) {
            const chNd = nd.childNodes[i];
            const txtLength = chNd?.textContent?.length;
            if (!txtLength) { continue; }
            // Second condition is to eliminate situation when start position
            // is at the end of the node. In this case selection should start at the next node. 
            if (res.offset < txtLength || (i+1 === nd.childNodes.length && res.offset === txtLength)) { 
                return getChildNodeByIndex(chNd, res.offset);
            }
            res.offset -= txtLength;
        }
        const lastNode = nd.childNodes[nd.childNodes.length - 1];
        res = {node: lastNode, offset: lastNode.textContent ? lastNode.textContent.length : 0}
    }
    return res;
}
 
/**
 * Returns node chain from root node to specified node.
 *
 * @param nd - Specified child node - end of hierarchy.
 * @param rootNode - Root node - start of hierarchy.
 * @returns List of nodes representing hierarchy from `rootNode` to `nd`.
 */
export function getNodeHierarchy(nd: Node, rootNode: Node): Node[] {
    const nodeHierarchy: Node[] = [nd] 
    while(nd.parentNode && !nd.isSameNode(rootNode)) {
        nd = nd.parentNode;
        nodeHierarchy.push(nd);
    }
    return nodeHierarchy.reverse();
}

/**
 * Returns node where start and end hierarchies split.
 *
 * @param startHierarchy - Hierarchy 1.
 * @param rndHierarchy - Hierarchy 2
 * @returns Latest common node for hierarchies, counting from root node.
 */
export function getCommonNode(startHierarchy: Node[], endHierarchy: Node[]) : Node {
    const maxDepth = Math.min(startHierarchy.length, endHierarchy.length)

    for (let depth=1; depth<maxDepth; depth++) {
        if (!startHierarchy[depth].isSameNode(endHierarchy[depth])) {
            return startHierarchy[depth-1]
        }
    }
    return startHierarchy[maxDepth-1];
}

/**
 * Verifies if childNode is in children node chain od parentNode.
 *
 * @param childNode - Child node.
 * @param parentNode - Parent node.
 * @returns True if parentNode is parent of grandParent to childNode.
 */
export function isChildOrGrandChild(childNode: Node, parentNode: Node): boolean {
    let pNd = childNode.parentNode;
    while (pNd) {
        if (pNd.isSameNode(parentNode)) {return true;}
        pNd = pNd.parentNode;
    }
    return false;
}

/**
 * Looks for the closest text node on the left side from specified node.
 *
 * @param nd - Node
 * @returns Previous text node.
 */
export function getPreviousSiblingWithText(nd: Node): Node | undefined {
    while (nd.previousSibling) {
        nd = nd.previousSibling;
        if (nd.textContent && nd.textContent.length > 0) {return nd;}
    }
    if (!nd.parentNode) {return;}
    return getPreviousSiblingWithText(nd.parentNode);
}

/**
 * Looks for the last text node in specified node.
 *
 * @param nd - Node
 * @returns Last text node.
 */
export function getRightMostTextNode(nd: Node): Node | undefined {
    if (nd.nodeType === Node.TEXT_NODE) {return nd;}
    for (let i = nd.childNodes.length-1; i>=0; i--) {
        const chNd = nd.childNodes[i];
        if (chNd.textContent && chNd.textContent.length > 0) {
            return getRightMostTextNode(chNd);
        }
    }
}

/**
 * Looks for the first text node in specified node.
 *
 * @param nd - Node
 * @returns First text node.
 */
export function getLeftMostTextNode(nd: Node): Node | undefined {
    if (nd.nodeType === Node.TEXT_NODE) {return nd;}
    for (let i = 0; i < nd.childNodes.length; i++) {
        const chNd = nd.childNodes[i];
        if (chNd.textContent && chNd.textContent.length > 0) {
            return getLeftMostTextNode(chNd);
        }
    }
}

/**
 * Insert specified node after reference node.
 *
 * @param refNd - Reference node.
 * @param nd - Node to be inserted.
 */
export function insertAfter(refNd: Node, nd: Node): void {
    if (!refNd.parentNode) {
        console.error("insertAfter: reference node is detached.");
        return;
    }
    if (refNd.nextSibling) {
        refNd.parentNode.insertBefore(nd, refNd.nextSibling);
    } else {
        refNd.parentNode.appendChild(nd);
    }
}

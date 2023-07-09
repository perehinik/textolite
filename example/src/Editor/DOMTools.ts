export type Position = {
    node: Node,
    offset: number
};

export function getChildNodeByIndex(nd: Node, index: number): Position {
    if (nd.childNodes?.length) {
        for (let i=0; i < nd.childNodes.length; i++) {
            const chNd = nd.childNodes[i];
            const txtLength = chNd?.textContent?.length;
            if (!txtLength) { continue; }
            // Second condition is to eliminate situation when start position
            // is at the end of the node. In this case selection should start at the next node. 
            if (index < txtLength || (i+1 === nd.childNodes.length && index === txtLength)) { 
                return getChildNodeByIndex(chNd, index);
            }
            index -= txtLength;
        }
    }
    return {node: nd, offset: index} as Position;
}

// Returns node chain from specified node to root node. 
export function getNodeHierarchy(nd: Node, rootNode: Node): Node[] {
    let nodeHierarchy: Node[] = [nd] 
    while(nd.parentNode && !nd.isSameNode(rootNode)) {
        nd = nd.parentNode;
        nodeHierarchy.push(nd);
    }
    return nodeHierarchy.reverse();
}

// Get node where hierarchies split.
export function getCommonNode(startHierarchy: Node[], endHierarchy: Node[]) : Node {
    const maxDepth = Math.min(startHierarchy.length, endHierarchy.length)

    for (let depth=1; depth<maxDepth; depth++) {
        if (!startHierarchy[depth].isSameNode(endHierarchy[depth])) {
            return startHierarchy[depth-1]
        }
    }
    return startHierarchy[maxDepth-1];
}
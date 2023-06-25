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
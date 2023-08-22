import { 
    getChildNodeByIndex, 
    getNodeHierarchy, 
    getCommonNode, 
    isChildOrGrandChild,
    getPreviousSiblingWithText,
    getRightMostTextNode,
    getLeftMostTextNode,
    insertAfter
} from "./DOMTools";

export type SelectionAdj = {
    startNode: Node,
    startOffset: number,
    endNode: Node,
    endOffset: number,
    commonNode: Node,
    rootNode?: Node,
    startIndex?: number,
    endIndex?: number,
    isEmpty: boolean
};


export function getAdjSelection(splitNodes: boolean, rootNode: Node): SelectionAdj | undefined {
    let sel = window.getSelection();
    if (!sel || !sel.anchorNode || !sel.focusNode || !rootNode) {return;}

    const selIsOneNode = sel.anchorNode.isSameNode(sel.focusNode);

    let commonNode = sel.anchorNode.parentNode ? sel.anchorNode.parentNode : sel.anchorNode;
    let reverseSelection = sel.anchorOffset < sel.focusOffset || !selIsOneNode ? false : true;

    if (!selIsOneNode) {
        const anchorHierarchy = getNodeHierarchy(sel.anchorNode, rootNode);
        const focusHierarchy = getNodeHierarchy(sel.focusNode, rootNode);
        commonNode = getCommonNode(anchorHierarchy, focusHierarchy);
        reverseSelection = isReverseSelection(anchorHierarchy, focusHierarchy, commonNode);
    }

    let selAdj: SelectionAdj = {
        startNode: reverseSelection ? sel.focusNode : sel.anchorNode,
        startOffset: reverseSelection ? sel.focusOffset : sel.anchorOffset,
        endNode: reverseSelection ? sel.anchorNode : sel.focusNode,
        endOffset: reverseSelection ? sel.anchorOffset : sel.focusOffset,
        commonNode: commonNode,
        isEmpty: (selIsOneNode && sel.anchorOffset === sel.focusOffset)
    };

    if (selAdj.isEmpty) {return selAdj;}

    selAdj.startIndex = getIndex(selAdj.startNode, selAdj.startOffset, rootNode as Node);
    selAdj.endIndex = getIndex(selAdj.endNode, selAdj.endOffset, rootNode as Node);

    if (splitNodes) {
        selAdj = splitSelectionNodes(selAdj);
    }
    return fixSelectionEnd(selAdj);
}


export function restoreSelection(nd: Node, startIndex: number, endIndex: number): void {
    const startNd = getChildNodeByIndex(nd, startIndex);
    const endNd = getChildNodeByIndex(nd, endIndex);
    if (endNd.offset === 0) {
        const prevSibl = getPreviousSiblingWithText(endNd.node);
        if (prevSibl) {
            const txtNode = getRightMostTextNode(prevSibl);
            if (txtNode?.textContent) {
                endNd.node = txtNode;
                endNd.offset = txtNode.textContent.length
            }
        }
    }
    setSelection(startNd.node, startNd.offset, endNd.node, endNd.offset);
}

export function setSelection(startNd: Node, startOffset: number, endNd: Node, endOffset: number): void {
    let sel = window.getSelection();
    const selRange = document.createRange();
    selRange.setStart(startNd, startOffset);
    selRange.setEnd(endNd, endOffset);
    sel?.removeAllRanges();
    sel?.addRange(selRange);
}

// This fixes situation when selection ends with index 0.
// In this case selection end is replaced with the end of previous text node.
function fixSelectionEnd(sel: SelectionAdj): SelectionAdj {
    if (sel.endOffset !== 0) {return sel;}
    const prevSibl = getPreviousSiblingWithText(sel.endNode);
    if (!prevSibl) {return sel;}
    const txtNode = getRightMostTextNode(prevSibl);
    if (!txtNode || !txtNode.textContent) {return sel;}
    sel.endNode = txtNode;
    sel.endOffset = txtNode.textContent.length;
    return sel;
}


function getIndex(nd: Node | null, offset: number, rootNode: Node) : number | undefined {
    if (!nd?.parentElement ) {return;};
    let currentNode = nd;
    let index = 0;
    let prevNode : Node;
    let content = [];

    while (true) {
        prevNode = currentNode
        currentNode = currentNode.parentNode as Node;
        let nodeList = currentNode.childNodes;

        for (let i = 0; i < nodeList.length; i++) {
            const childNode = nodeList[i];

            if (childNode?.textContent && childNode.childNodes.length === 0) {
                content.push(childNode?.textContent);
            }
            if (childNode === nd) {
                index += offset;
                break;
            }
            else if (childNode === prevNode) {
                break;
            }
            if (childNode?.textContent) {
                index += childNode?.textContent.length;
            }
        }
        
        if (currentNode.isSameNode(rootNode.parentNode)) {
            return index;
        }
    }
}


function isReverseSelection(anchorHierarchy: Node[], focusHierarchy: Node[], commonNode: Node) : boolean {
    const maxDepth = Math.min(anchorHierarchy.length, focusHierarchy.length)
    let commonNodeDepth = 0;
    for (let depth = 0; depth<maxDepth; depth++) {
        if (commonNode.isSameNode(anchorHierarchy[depth])) {
            commonNodeDepth = depth;
        }
    }
    
    for (let i=0; i<commonNode.childNodes.length; i++){
        const nd = commonNode.childNodes[i];
        if (nd.isSameNode(anchorHierarchy[commonNodeDepth + 1])) {return false;}
        if (nd.isSameNode(focusHierarchy[commonNodeDepth + 1])) {return true;}
    }
    return false;
}


function limitSelectionToNode(selAdj: SelectionAdj, limitNode: Node): SelectionAdj {
    // Fix situation when selection is out of root node.
    let startEndNodeUpdated = false;
    if (!isChildOrGrandChild(selAdj.startNode, limitNode)&& !selAdj.startNode.isSameNode(limitNode)) {
        const startNode = getLeftMostTextNode(limitNode)
        if (startNode) {
            selAdj.startNode = startNode;
            selAdj.startOffset = 0;
            startEndNodeUpdated = true;
        }
    }
    if (!isChildOrGrandChild(selAdj.endNode, limitNode) && !selAdj.endNode.isSameNode(limitNode)) {
        const endNode = getRightMostTextNode(limitNode);
        if (endNode) {
            selAdj.endNode = endNode;
            selAdj.endOffset = endNode.textContent ? endNode.textContent.length : 0;
            startEndNodeUpdated = true;
        }
    }
    if (startEndNodeUpdated) {
        const selIsOneNode = selAdj.startNode.isSameNode(selAdj.endNode);
        //if (selIsOneNode && sel.anchorOffset === sel.focusOffset) {return;}

        let commonNode = selAdj.startNode.parentNode ? selAdj.startNode.parentNode : selAdj.startNode;

        if (!selIsOneNode) {
            let anchorHierarchy = getNodeHierarchy(selAdj.startNode, limitNode);
            let focusHierarchy = getNodeHierarchy(selAdj.endNode, limitNode);
            commonNode = getCommonNode(anchorHierarchy, focusHierarchy);
        }
        selAdj.commonNode = commonNode;
    }
    return selAdj;
}


function splitSelectionNodes(selAdj: SelectionAdj): SelectionAdj {
    const selIsOneNode = selAdj.startNode.isSameNode(selAdj.endNode);
    // Check if selection is on the middle of some node.
    // If yes, then that node should be splitted in order to be able to apply style
    // only on part of node.
    if (selAdj.startOffset != 0 || (selAdj.endOffset != selAdj.endNode.textContent?.length && selAdj.endOffset != 0)) {
        selAdj.startNode = splitStart(selAdj.startNode, selAdj.startOffset);
        
        // If whole selection range is in same node.
        if (selIsOneNode) {
            selAdj.endNode = splitEnd(selAdj.startNode, selAdj.endOffset - selAdj.startOffset)
            selAdj.startNode = selAdj.endNode;
        } else {
            selAdj.endNode = splitEnd(selAdj.endNode, selAdj.endOffset);
        }
        selAdj.startOffset = 0;
        selAdj.endOffset = selAdj.endNode.textContent ? selAdj.endNode.textContent.length : 0;
    }
    return selAdj;
}


function splitStart(nd: Node, offset: number): Node {
    if (nd.nodeType !== Node.TEXT_NODE) {
        console.error("splitStart accepts only text nodes, not ", nd.nodeType);
        return nd;
    }
    if (!nd.textContent || offset === 0) {return nd;}
    const textContent = nd.textContent;
    //1. create span replacement
    let ndInsert = document.createElement("span");
    const ndText = document.createTextNode("");
    ndInsert.appendChild(ndText);
    //2. remove first part from original
    nd.textContent = textContent ? textContent.substring(0, offset) : null;
    //3. remove second part from copy
    ndInsert.textContent = textContent ? textContent.substring(offset) : null;
    //4. insert copy before original
    insertAfter(nd, ndInsert);
    return ndInsert.childNodes[0];
}


function splitEnd(nd: Node, offset: number): Node {
    if (nd.nodeType !== Node.TEXT_NODE) {
        console.error("splitEnd accepts only text nodes, not ", nd.nodeType);
        return nd;
    }
    if (!nd.textContent || offset === nd.textContent.length) {return nd;}
    const textContent = nd.textContent;
    //1. create span replacement
    let ndInsert = document.createElement("span");
    const ndText = document.createTextNode("");
    ndInsert.appendChild(ndText);
    //2. remove first part from original
    nd.textContent = textContent.substring(offset);
    //3. remove second part from copy
    ndInsert.textContent = textContent.substring(0, offset);
    //4. insert copy before original
    if (nd.parentNode) {
        ndInsert = nd.parentNode.insertBefore(ndInsert, nd);
    } else {
        console.log("wrong end element");
    }
    return ndInsert.childNodes[0];
}


export const onlyForTesting = {
    fixSelectionEnd,
    getIndex,
    isReverseSelection,
    limitSelectionToNode,
    splitSelectionNodes,
    splitStart,
    splitEnd
}

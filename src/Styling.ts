import { SelectionAdj } from "./SelectionAdj";
import { optimyzeNode } from './OptimyzeDOM';
import { restoreSelection, fixSelectionEnd } from "./SelectionAdj";
import { getNodeHierarchy, getCommonNode } from "./DOMTools";

export type CSSObj = { [name: string]: string };

export const defaultStyle: CSSObj = {
    'font-weight': 'normal',
    'font-style': 'normal',
    'text-decoration': 'none'
}

// Returns style of single object, without children.
export function getStyle(nd?: HTMLElement): CSSObj {
    const ndStyle: CSSObj = {};
    if (nd?.style?.length) {
        for (let styleId = 0; styleId < nd.style.length; styleId ++) {
            const stylePropName: string = nd.style[styleId];
            ndStyle[stylePropName] = nd.style.getPropertyValue(stylePropName);
        }
    }
    return ndStyle;
}

// Returns node style with consideration of styles of all parent nodes.
export function getStyleFromRoot(nd: Node): CSSObj {
    const ndHierarchy = getNodeHierarchy(nd, document.body);
    let ndStyle = {} as CSSObj;
    ndHierarchy.forEach((item) => {
        const chStyle = getStyle(item as HTMLElement);
        ndStyle = applyOverlappingStyle(ndStyle, chStyle);
    })
    return ndStyle;
}

function combineNestedStyles(style1: CSSObj, style2?: CSSObj): CSSObj {
    const res = {...style1};
    if (!style2) {return res;}
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
function getNodeNestedStyle(nd: Node, style: CSSObj, limitListStart: Node[], limitListEnd: Node[], startLimited: boolean, endLimited: boolean): CSSObj | undefined  {
    if (nd.nodeType === Node.TEXT_NODE) { return style; } // end of recursion
    if (!nd.childNodes) { return }

    const ndStyle = applyOverlappingStyle(style, getStyle(nd as HTMLElement));
    let result: CSSObj | undefined = undefined;
    let startFound = !startLimited;
    
    for (let ndI = 0; ndI < nd.childNodes.length; ndI ++) {
        const chNd = nd.childNodes[ndI];
        const thisIsEndNode = endLimited && startFound && limitListEnd.includes(chNd);
        let chStyle: CSSObj | undefined = undefined;
        if (startFound) {
            chStyle = getNodeNestedStyle(chNd, ndStyle, limitListStart, limitListEnd, false, thisIsEndNode);
        } else if (limitListStart.includes(chNd)) {
            // No need to check if start is limited, if it went here - start is limited.
            startFound = true;
            chStyle = getNodeNestedStyle(chNd, ndStyle, limitListStart, limitListEnd, true, false);
        }
        if (chStyle) {
            result = combineNestedStyles(chStyle, result);
        }
        if (thisIsEndNode) { break; }
    }

    return result;
}

// Returns style of specified node and all children.
// If for some property there are multiple styles - returns '*x*'
export function getNestedStyle(sel: SelectionAdj): CSSObj {
    const commonNodeStyle = getStyleFromRoot(sel.commonNode);
    
    if (sel.isEmpty) {
        const chStyle = getStyle(sel.startNode as HTMLElement);
        return applyOverlappingStyle(commonNodeStyle, chStyle);
    }

    const startHierarchy = getNodeHierarchy(sel.startNode, sel.commonNode);
    const endHierarchy = getNodeHierarchy(sel.endNode, sel.commonNode);
    const limitList = startHierarchy.concat(endHierarchy);
    const style = getNodeNestedStyle(sel.commonNode, commonNodeStyle, startHierarchy, endHierarchy, true, true);

    return style ? style : commonNodeStyle;
}

// If child node has text type then it uses parent node style
function getParentStyle(nd: Node) {
    return getStyle(nd.parentNode as HTMLElement);
}

function* ndChildrenIter(nd: Node): IterableIterator<Node> {
    if (!nd.childNodes.length) { return;}
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
function* rangeStartIter(sel: SelectionAdj): IterableIterator<Node> {
    const rootNode = sel.rootNode;
    let currentNode = sel.startNode;
    if (!currentNode) {return sel.startNode;}
    let prevNode: Node = currentNode;

    yield currentNode;

    do {
        if (currentNode.nextSibling) {
            if (currentNode?.parentNode?.isSameNode(sel.commonNode)) {return;}
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
            currentNode = currentNode.parentNode as Node;
        }
    } while (currentNode && !currentNode.isSameNode(sel.commonNode) && (!rootNode || !currentNode.isSameNode(rootNode)))
}

export function setStyle(sel: SelectionAdj, style: CSSObj): void {
    let rootP = document.getElementById("txt-root");
    console.log("setstyle selection", sel)
    
    // If start and end nendNodeode are the same - selection in one node.
    if (sel.startNode.isSameNode(sel.endNode)) {
        updateNodeStyle(sel.startNode, style);
        restoreSelection(
            sel.startNode, 
            sel.startOffset, 
            sel.endOffset
        );
        return;
    } 
    
    const rootAnchor = setStyleFromStart(sel, style); 
    const rootFocus = setStyleFromEnd(sel, style);
    console.log("ra:",rootAnchor?.textContent, "rf:",rootFocus?.textContent);
    let node: Node = rootAnchor?.nextSibling as Node
    while(node && !node.isSameNode(rootFocus)) {
        console.log("middle:", node.textContent)
        node = updateNodeStyle(node, style);
        resetChildrenStyle(node, style);
        node = node.nextSibling as Node;
    }

    // Optimize DOM structure after style update

    //ToDo IP: this can be upgraded to optimyze only modified nodes, not the whoile editor tree.
    const nodeReplacement = rootP ? optimyzeNode(rootP, defaultStyle) : null;
    if (rootP && rootP.parentNode && nodeReplacement) {
        rootP.parentNode.replaceChild(nodeReplacement, rootP) 
    }

    // Because DOM structure may have been changed we need to update selection range
    restoreSelection(
        nodeReplacement as Node, 
        sel.startIndex ? sel.startIndex : 0, 
        sel.endIndex ? sel.endIndex : 0
    );
}

export function updateNodeStyle(nd: Node, newStyle: CSSObj) : Node {
    if (nd.nodeName == "BR") {return nd;}
    const el = nd as HTMLElement;
    // If node has style property then style can be changed directly
    if (el.style) {
        for(let key in newStyle) {
            el.style.setProperty(key, newStyle[key]);
        }
    }
    // Case when target node is the text node and it's the only node in parent node.
    // In this case it should be safe to change parent style.
    else if (nd.parentNode?.childNodes.length === 1 && (nd.parentNode as HTMLElement)?.style) {
        updateNodeStyle(nd.parentNode, newStyle);
    // Case when target node is the text node but it's NOT the only node in parent node.
    // So text node should be replaces with span in order to set style of this part of text.
    } else if (nd.nodeType === Node.TEXT_NODE){
        const ndSpan = document.createElement("span");
        ndSpan.textContent = nd.textContent;
        updateNodeStyle(ndSpan, newStyle)
        nd.parentNode?.replaceChild(ndSpan, nd)
        return ndSpan;
    }
    return nd;
}

function resetChildrenStyle(nd: Node, newStyle: CSSObj) : void{
    nd.childNodes.forEach(ndChild => {
        const el = ndChild as HTMLElement;
        if (el.style) { 
            for(let key in newStyle) {
                el.style.setProperty(key, "");
            }
        }
        resetChildrenStyle(ndChild, newStyle);
    })
}

function setStyleFromStart(sel: SelectionAdj, newStyle: CSSObj): Node | undefined {
    const rootNode = sel.rootNode;
    let currentNode = sel.startNode;
    if (!currentNode) {return sel.startNode;}
    let prevNode: Node = currentNode;

    currentNode = updateNodeStyle(currentNode, newStyle)

    do {
        if (currentNode.nextSibling) {
            if (currentNode?.parentNode?.isSameNode(sel.commonNode)) {return currentNode;}
            currentNode = currentNode.nextSibling as Node;
            currentNode = updateNodeStyle(currentNode, newStyle);
            resetChildrenStyle(currentNode, newStyle);
        }
        else {
            prevNode = currentNode;
            currentNode = currentNode.parentNode as Node;
        }
    } while (currentNode && !currentNode.isSameNode(sel.commonNode) && (!rootNode || !currentNode.isSameNode(rootNode)))

    return prevNode;
}

function setStyleFromEnd(sel: SelectionAdj, newStyle: CSSObj): Node {
    const rootNode = sel.rootNode;
    let currentNode = sel.endNode;
    if (!currentNode) {return sel.endNode;}
    let prevNode: Node = currentNode;

    currentNode = updateNodeStyle(currentNode, newStyle)

    do {
        if (currentNode.previousSibling) {
            if (currentNode?.parentNode?.isSameNode(sel.commonNode)) {return currentNode;}
            currentNode = currentNode.previousSibling as Node;
            currentNode = updateNodeStyle(currentNode, newStyle);
            resetChildrenStyle(currentNode, newStyle);
        }
        else {
            prevNode = currentNode;
            currentNode = currentNode.parentNode as Node;
        }
    } while (currentNode && !currentNode.isSameNode(sel.commonNode) && (!rootNode || !currentNode.isSameNode(rootNode)))

    return prevNode;
}   

export function applyOverlappingStyle(parentStyle?: CSSObj, childStyle?: CSSObj): CSSObj {
    if (!parentStyle) {return {...childStyle} as CSSObj};
    const chNdStyle: CSSObj = {...parentStyle};
    if (childStyle) {
        for (let styleName in childStyle) {
            chNdStyle[styleName] = childStyle[styleName];
        }
    }
    return chNdStyle;
}

export function compareChildStyle(parentStyle?: CSSObj, childStyle?: CSSObj): boolean {
    if (!parentStyle && childStyle) {return false;}
    for (let cssName in childStyle) {
        if (parentStyle && parentStyle[cssName] !== childStyle[cssName]) {return false;}
    }
    return true;
}

export function compareNodeStyles(Style1: CSSObj, Style2: CSSObj): boolean {
    if (Object.keys(Style1).length !== Object.keys(Style2).length) {return false;}
    for (let cssName in Style1) {
        if (Style1[cssName] !== Style2[cssName]) {return false;}
    }
    return true;
}

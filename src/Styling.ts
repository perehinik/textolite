/**
 * @module Styling - Module contains tools for working with node styles.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { SelectionAdj } from "./SelectionAdj";
import { getNodeHierarchy } from "./DOMTools";

export type CSSObj = { [name: string]: string };

/**
 * Default styles used in editor.
 */
export const defaultStyle: CSSObj = {
    selector: ".defaultStyle",
    'font-weight': 'normal',
    'font-style': 'normal',
    'text-decoration': 'none',
    'letter-spacing': '0px',
    'line-height': '1.2',
    'font-family': 'Arial',
    'font-size': '12pt'
    //'vertical-align': 'sub'/'super'
}

/**
 * Default styles for all paragraphs used in editor.
 */
export const defaultStyleP: CSSObj = {
    selector: ".defaultStyle p",
    'margin-block-start': '0em',
    'margin-block-end': '0em',
    'margin-inline-start': '0px',
    'margin-inline-end': '0px',
    'text-indent': '1em',
}

/**
 * Default styles combined into HTML style node,.
 * So it's easier to insert CSS class into DOM.
 */
export const defaultStyleNode: HTMLStyleElement = buildStyleNode(defaultStyle, defaultStyleP);

/**
 * Encapsulates multiple/single styles into style node.
 *
 * @param - single or multiple CSSObj.
 * @returns - CSSObj styles combined into HTML style node,.
 */
export function buildStyleNode(...args: CSSObj[]): HTMLStyleElement {
    let style = document.createElement('style');
    let styleDescription = "";
    for (let cssId = 0; cssId < args.length; cssId++) {
        if (!args[cssId].selector) {
            continue;
        }
        styleDescription += `${args[cssId].selector} {\n`;
        for (let i = 0; i < Object.keys(args[cssId]).length; i++) {
            const property = Object.keys(args[cssId])[i];
            if (property === "selector") {
                continue;
            }
            const value = args[cssId][property];
            styleDescription += `${property}: ${value};\n`;
        }
        styleDescription += '}\n\n';
    }
    style.innerHTML = styleDescription;
    return style;
}

/**
 * This string should be used in CSSObj if style is undefined/unknown.
 */
export const undefinedStyle: string = "*x*";

/**
 * Returns style of specified node, without children. 
 *
 * @param nd - The node from which styles will be copied.
 * @returns Object with style parameters from specified node.
 */
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

/**
 * Combines 2 style objects into 1.
 * For style parameters which are not same for 2 objects - use child style.
 *
 * @param parentStyle - Object with parent styles.
 * @param childStyle - Object with child styles.
 * @returns Object with combined style. Child style has preferende
 */
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

/**
 * Returns node style with consideration of styles of all parent nodes.
 *
 * @param nd - End node.
 * @returns Object with style combined from `body` node to `nd`
 */
export function getStyleFromRoot(nd: Node): CSSObj {
    const ndHierarchy = getNodeHierarchy(nd, document.body);
    let ndStyle = {} as CSSObj;
    ndHierarchy.forEach((item) => {
        const chStyle = getStyle(item as HTMLElement);
        ndStyle = applyOverlappingStyle(ndStyle, chStyle);
    })
    return ndStyle;
}

/**
 * Combines 2 style objects.
 * Style parameters which are not same for 2 objects replaced with "*x*"
 *
 * @param style1 - Style object 1.
 * @param style1 - Style object 2.
 * @returns Object with combined style.
 */
function combineNestedStyles(style1: CSSObj, style2?: CSSObj): CSSObj {
    const res = {...style1};
    if (!style2) {return res;}
    for (let key in style2) {
        if (!Object.keys(style1).includes(key) || style1[key] !== style2[key]) {
            res[key] = undefinedStyle;
        }
    }
    for (let key in style1) {
        if (!Object.keys(style2).includes(key)) {
            res[key] = undefinedStyle;
        }
    }
    return res;
}

/**
 * Returns nested style for specified node and all children.
 * Collects styles from all children nodes and combines them.
 * If for some property there are multiple styles - returns '*x*'
 *
 * @param nd - Start node. Result will contain style from this node and all children.
 * @param parentStyle - Style from nd and all children will be applied over styles in this object.
 * @param limitListStart - If `startLimited` all siblings nodes before nodes in this list will be skipped.
 * @param limitListEnd - If `endLimited` all siblings nodes after nodes in this list will be skipped.
 * @param startLimited - If true - styles are collectred only after spotting node which is in limitList.
 * @param endLimited - If true - styles are not collectred after spotting node which is in limitList.
 * @returns Object with nested style.
 */
function getNodeNestedStyle(
    nd: Node, 
    parentStyle: CSSObj, 
    limitListStart: Node[], 
    limitListEnd: Node[], 
    startLimited: boolean, 
    endLimited: boolean
): CSSObj | undefined  {
    if (nd.nodeType === Node.TEXT_NODE) { return parentStyle; } // end of recursion
    if (!nd.childNodes || nd.textContent === "") { return }

    const ndStyle = applyOverlappingStyle(parentStyle, getStyle(nd as HTMLElement));
    let result: CSSObj | undefined = undefined;
    let startFound = !startLimited;

    for (let ndI = 0; ndI < nd.childNodes.length; ndI ++) {
        const chNd = nd.childNodes[ndI];
        const thisIsEndNode = endLimited && limitListEnd.includes(chNd);
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
        if (thisIsEndNode ) { break; }
    }
    return result;
}

/**
 * Returns nested style for specified selection.
 * If for some property there are multiple styles - returns '*x*'
 *
 * @param sel - Adjusted selection object.
 * @returns Object with nested style.
 */
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

/**
 * Set style for selection.
 *
 * @param sel - Adjusted selection object.
 * @param style - Style object.
 */
export function setStyle(sel: SelectionAdj, style: CSSObj): void {
    if (!sel || !sel.startNode) {return;}
    // If start and end nendNodeode are the same - selection in one node.
    if (sel.startNode.isSameNode(sel.endNode)) {
        if (sel.startOffset !== sel.endOffset) {
            updateNodeStyle(sel.startNode, style);
        }
        return;
    } 
    
    const rootAnchor = setStyleFromStart(sel, style); 
    const rootFocus = setStyleFromEnd(sel, style);
    let node: Node = rootAnchor?.nextSibling as Node
    while(node && !node.isSameNode(rootFocus)) {  
        node = updateNodeStyle(node, style);
        resetChildrenStyle(node, style);
        node = node.nextSibling as Node;
    }
}

/**
 * Set style for specified node. Children style is not modified.
 *
 * @param nd - Node.
 * @param newStyle - Style object.
 * @returns - Node with new style. In some cases specified node(nd) can be replaced with new node.
 */
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

/**
 * Reset specified style properties in children nodes.
 *
 * @param nd - Node.
 * @param newStyle - Properties from this object will be reseted.
 */
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

/**
 * Set style for start node and all sibling after it.
 * Works rcursively untill reaching selection commonNode.
 *
 * @param sel - Adjusted selection object.
 * @param newStyle - Style that shoul be applied.
 * @returns - Latest node where style was applied.
 */
function setStyleFromStart(sel: SelectionAdj, newStyle: CSSObj): Node | undefined {
    const rootNode = sel.rootNode;
    let currentNode = sel.startNode;
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

/**
 * Set style for end node and all sibling before it.
 * Works rcursively untill reaching selection commonNode.
 *
 * @param sel - Adjusted selection object.
 * @param newStyle - Style that shoul be applied.
 * @returns - Latest node where style was applied.
 */
function setStyleFromEnd(sel: SelectionAdj, newStyle: CSSObj): Node {
    const rootNode = sel.rootNode;
    let currentNode = sel.endNode;
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

/**
 * Compares parent style and child style.
 * If any property in child style overwrites parent style, and not the same - returns false.
 *
 * @param parentStyle - Parent node style.
 * @param childStyle - Child node style.
 * @returns - True if child style does not overwrite any parent style.
 */
export function compareChildStyle(parentStyle?: CSSObj, childStyle?: CSSObj): boolean {
    if (!parentStyle && childStyle) {return false;}
    for (let cssName in childStyle) {
        if (parentStyle && parentStyle[cssName] !== childStyle[cssName]) {return false;}
    }
    return true;
}

/**
 * Compares node styles.
 * Returns true only if two style objects are the same.
 *
 * @param style1 - Style 1 object.
 * @param style2 - Style 2 object.
 * @returns - True if two styles aree the same.
 */
export function compareNodeStyles(style1: CSSObj, style2: CSSObj): boolean {
    if (Object.keys(style1).length !== Object.keys(style2).length) {return false;}
    for (let cssName in style1) {
        if (style1[cssName] !== style2[cssName]) {return false;}
    }
    return true;
}


export const onlyForTesting = {
    combineNestedStyles,
    getNodeNestedStyle,
    resetChildrenStyle,
    setStyleFromStart,
    setStyleFromEnd
}

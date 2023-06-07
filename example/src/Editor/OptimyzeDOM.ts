/*
DOM optimization by style.

Removes child nodes with same stayle as parent's.
1. Compare style for all childen nodes with parent node's style. Start from left to right.
2. If there are more then one child node with same style as node - concatenate them into text node.
3. If parent node contains only 1 node with style(not text) - move applied styles and text 
    from child to parent, remove child.
4. If all child nodes have same style as parent -> 

Same logic shoul be applied from deapest node to target node(depth first.)
*/

type CSSObj = { [name: string]: string };

// returns replacement node for provided node or nothing.
export function optimyzeNode(nd: Node, parentStyle?: CSSObj): Node | undefined {
    // if it's a leaf
    if (nd.nodeType === Node.TEXT_NODE) {return nd;}
    if (nd.childNodes.length === 0) {return;}
    let optimizationRezult: Node | undefined = nd.cloneNode();
    let segmentText: string = "";
    let segmentType: string = "TEXT";
    let segmentStyle: CSSObj = {};

    const ndStyle = getStyle(nd as HTMLElement);

    for (let childId = 0; childId < nd.childNodes.length; childId++) {
        const childNd = nd.childNodes[childId];// as HTMLElement;
        if (!childNd.textContent) {continue;}

        // This can return text node(concatenated) if style of childNd and all it's children
        // is the same as childNd.parentNode
        // Otherwise it should return nothing or modified copy of childNd.
        const chNdReplace = optimyzeNode(childNd, concatStyles(parentStyle, ndStyle));
        const chNdReplaceStyle = getStyle(chNdReplace as HTMLElement);
        const nodeType = chNdReplace?.nodeType === Node.TEXT_NODE ? "TEXT" : chNdReplace?.nodeName;

        //console.log(nodeType, childNd.textContent, chNdReplaceStyle, segmentType, segmentStyle)

        // This should be removed in order to implement other node types.
        if (nodeType !== "TEXT" && nodeType !== "SPAN"  && nodeType !== "P") {continue;}
        
        // Node contains more than 1 child so can't be optimized
        if (chNdReplace?.childNodes?.length && chNdReplace.childNodes.length > 1) {
            addChild(optimizationRezult, segmentType, segmentText, segmentStyle);
            optimizationRezult.appendChild(chNdReplace);
            segmentText = "";
            segmentType = "TEXT";
            segmentStyle = {};
        }
        // Node has same style as previous sibling so can be merged with it.
        else if (nodeType === segmentType && compareNodeStyles(segmentStyle, chNdReplaceStyle)) {
            segmentText += childNd.textContent;
            continue;
        // Node is different from previous sibling so new segment should be started.
        } else {
            addChild(optimizationRezult, segmentType, segmentText, segmentStyle);
            segmentText = childNd.textContent;
            segmentType = nodeType ? nodeType : "";
            segmentStyle = chNdReplaceStyle;
        }  
    }
    // No nested SPANs, just text
    if (!optimizationRezult.childNodes.length) {
        if (nd.parentNode && compareChildStyle(parentStyle, ndStyle) || segmentText === "") {
            return document.createTextNode(segmentText);
        } else {
            optimizationRezult.textContent = segmentText;
            for (let styleName in segmentStyle) {
                (optimizationRezult as HTMLElement).style.setProperty(styleName, segmentStyle[styleName]);
            }
        }
    // There are nested SPANs and some text at the end.
    } else {
        addChild(optimizationRezult, segmentType, segmentText, segmentStyle);
    }
    return optimizationRezult;
}

function addChild(pNd: Node, chNdType?: string, textContent?: string, style?: CSSObj){
    if (!textContent) { return; }
    chNdType = chNdType ? chNdType : "TEXT";
    style = style ? style : {};

    if (chNdType === "TEXT") {
        pNd.appendChild(document.createTextNode(textContent));
    } else {
        const ndNew = document.createElement(chNdType);
        ndNew.textContent = textContent;
        for (let styleName in style) {
            ndNew.style.setProperty(styleName, style[styleName]);
        }
        pNd.appendChild(ndNew);
    }
}

function getStyle(nd?: HTMLElement): CSSObj {
    const ndStyle: CSSObj = {};
    if (nd?.style?.length) {
        for (let styleId = 0; styleId < nd.style.length; styleId ++) {
            const stylePropName: string = nd.style[styleId];
            ndStyle[stylePropName] = nd.style.getPropertyValue(stylePropName);
        }
    }
    return ndStyle;
}

function concatStyles(parentStyle?: CSSObj, childStyle?: CSSObj): CSSObj {
    const chNdStyle: CSSObj = {...parentStyle};
    if (childStyle) {
        for (let styleName in childStyle) {
            chNdStyle[styleName] = childStyle[styleName];
        }
    }
    return chNdStyle;
}

function compareChildStyle(parentStyle?: CSSObj, childStyle?: CSSObj): boolean {
    if (!parentStyle && childStyle) {return false;}
    for (let cssName in childStyle) {
        if (parentStyle && parentStyle[cssName] !== childStyle[cssName]) {return false;}
    }
    return true;
}

function compareNodeStyles(Style1: CSSObj, Style2: CSSObj): boolean {
    if (Object.keys(Style1).length !== Object.keys(Style2).length) {return false;}
    for (let cssName in Style1) {
        if (Style1[cssName] !== Style2[cssName]) {return false;}
    }
    return true;
}

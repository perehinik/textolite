/**
 * @module OptimizeDOM - Module contains tools for DOM optimization.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { CSSObj, getStyle, applyOverlappingStyle, compareChildStyle, compareNodeStyles } from './Styling'

/**
 * Optimize Node and all children to concatenate/remove spans with same styles.
 *
 * @param nd - Node to be optimized.
 * @param parentStyle - Style of parent node.
 * @returns Optional node as result of optimization.
 */
export function optimizeNode(nd: Node, parentStyle?: CSSObj): Node | undefined {
    if (nd.nodeType === Node.TEXT_NODE) {return nd.cloneNode();}
    if (nd.nodeName === "BR") {return nd.cloneNode();}
    if (nd.childNodes.length === 0) {return;}

    const resNd = nd.cloneNode() as HTMLElement;
    const ndStyle = getStyle(nd as HTMLElement);
    const ndStyleAbs = applyOverlappingStyle(parentStyle, ndStyle);

    let res: Node[] = [];

    for (let childId = 0; childId < nd.childNodes.length; childId++) {
        const childNd = nd.childNodes[childId];

        // This can return text node(concatenated) if style of childNd and all it's children
        // is the same as childNd.parentNode
        // Otherwise it should return nothing or modified copy of childNd.
        const chNdReplace = optimizeNode(childNd, ndStyleAbs);
        if (!chNdReplace) {continue;}
        const chNdReplaceStyle = getStyle(chNdReplace as HTMLElement);
        const nodeType = (chNdReplace.nodeType === Node.TEXT_NODE ? "TEXT" : chNdReplace.nodeName).toUpperCase();

        if (nodeType === "BR" || nodeType === "TEXT" || nodeType === "P" ) {
            res.push(chNdReplace);
            continue;
        }
        // This should be removed in order to implement other node types.
        if (nodeType !== "SPAN") {continue;}

        // Style is the same so we can extract all nodes from inside.
        if (compareChildStyle(ndStyleAbs, chNdReplaceStyle)) {
            for (let i = 0; i < chNdReplace.childNodes.length; i++) {
                res.push(chNdReplace.childNodes[i]);
            }
        // Style is different so just push the whole node.
        } else {
            res.push(chNdReplace);
        }
    }

    res = optimizeNodeList(res);

    // Dont allow text nodes in DIV
    if (nd.nodeName === "DIV") {
        for (let i = 0; i < res.length; i++) {
            if (res[i].nodeType === Node.TEXT_NODE) {
                const replacement = document.createElement("P");
                replacement.textContent = res[i].textContent;
                res[i] = replacement;
            }
        }
    }

    if (res.length === 0 && nd.nodeName !== "DIV" && nd.nodeName !== "P") {return;}
    else if (res.length === 1 && nd.nodeName !== "DIV" && res[0].nodeName.toUpperCase() !== "P") {
        if (res[0].nodeName === "BR") {return res[0];}
        if (res[0].nodeType === Node.TEXT_NODE && nd.nodeName !== "P" && Object.keys(ndStyle).length === 0) {return res[0];}

        const resStyle = getStyle(res[0] as HTMLElement);

        if (res[0].nodeName === "SPAN") {
            while (res[0].childNodes.length > 0) {
                resNd.appendChild(res[0].childNodes[0]);
            }
        } else {   
            resNd.appendChild(res[0]);
        }

        if (resNd.style != undefined) {
            for(const key in resStyle) {
                resNd.style.setProperty(key, resStyle[key]);
            }
        }
        return resNd;        
    }

    for (let i = 0; i < res.length; i++) {
        resNd.appendChild(res[i]);
    }
    return resNd;  
}

/**
 * Optimize Node list. Concatenate neighbors with same style/type into 1 node.
 *
 * @param ndList - List of nodes.
 * @returns Optimized node list.
 */
export function optimizeNodeList(ndList: Node[]): Node[] {
    const res: Node[] = [];

    for (let i = 0; i < ndList.length; i++) {
        if (!ndList[i]?.nodeName) {continue;}
        if (i === 0) {
            res.push(ndList[i]);
            continue;
        }

        const lastAddedNode = res[res.length - 1];

        if (ndList[i]?.nodeName === "BR" && lastAddedNode?.nodeName === "SPAN") {
            lastAddedNode.appendChild(ndList[i]);
            continue;
        }
        if (lastAddedNode?.nodeType === Node.TEXT_NODE && ndList[i]?.nodeType === Node.TEXT_NODE) {
            if (lastAddedNode?.textContent != null && ndList[i].textContent != null) {
                lastAddedNode.textContent += ndList[i].textContent;
            }
            continue;
        }
        if (lastAddedNode?.nodeName !== ndList[i]?.nodeName || ndList[i]?.nodeName === "P" || ndList[i]?.nodeName === "p") {
            res.push(ndList[i]);
            continue;
        }

        const ndStyle1 = getStyle(lastAddedNode as HTMLElement);
        const ndStyle2 = getStyle(ndList[i] as HTMLElement);
        if (compareNodeStyles(ndStyle1, ndStyle2) && ndList[i]?.childNodes?.length) {
            while (ndList[i]?.childNodes?.length) {
                const chNd = ndList[i].childNodes[0];
                lastAddedNode.appendChild(chNd);
            }
            continue;
        }
        res.push(ndList[i]);
    }
    return res;
}

export const onlyForTesting = {
    optimizeNodeList
}

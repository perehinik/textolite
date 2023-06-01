"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
// Add tab handling
const OptimyzeDOM_1 = require("./OptimyzeDOM");
class Editor {
    fieldId;
    elements;
    containerId;
    setBold;
    constructor(divId) {
        const rootEl = document.getElementById(divId);
        if (rootEl) {
            rootEl.innerHTML = '';
        }
        this.fieldId = 0;
        this.containerId = divId;
        const rootP = this.createRootTextElement();
        this.elements = {
            [this.fieldId]: this.createSpan(this.fieldId)
        };
        this.fieldId += 1;
        this.elements[0].appendChild(this.createSpan(10));
        rootEl?.appendChild(rootP);
        rootP?.appendChild(this.elements[0]);
        rootP?.appendChild(this.createSpan(2));
        //this.settingsChanged = this.settingsChanged.bind(this);
        this.setBold = true;
    }
    createRootTextElement() {
        const firstTextEl = document.createElement("p");
        firstTextEl.contentEditable = "true";
        firstTextEl.id = "txt-root";
        firstTextEl.innerText = "template";
        firstTextEl.classList.add("text-box");
        return firstTextEl;
    }
    isChildOrGrandChild(childNode, parentNode) {
        let pNd = childNode.parentNode;
        while (pNd) {
            if (pNd.isSameNode(parentNode)) {
                return true;
            }
            pNd = pNd.parentNode;
        }
        return false;
    }
    getLastLeftChild(nd) {
        while (nd.childNodes.length > 0 && nd.childNodes[0].textContent) {
            nd = nd.childNodes[0];
        }
        return nd;
    }
    getLastRightChild(nd) {
        while (nd.childNodes.length > 0 && nd.childNodes[nd.childNodes.length - 1].textContent) {
            nd = nd.childNodes[nd.childNodes.length - 1];
        }
        return nd;
    }
    settingsChanged() {
        let sel = window.getSelection();
        let rootNode = document.getElementById(this.containerId);
        if (!sel || !sel.anchorNode || !sel.focusNode || !rootNode) {
            return;
        }
        const selIsOneNode = sel.anchorNode.isSameNode(sel.focusNode);
        // selection is empty
        if (selIsOneNode && sel.anchorOffset === sel.focusOffset) {
            return;
        }
        let commonNode = sel.anchorNode.parentNode ? sel.anchorNode.parentNode : sel.anchorNode;
        let reverseSelection = sel.anchorOffset < sel.focusOffset ? false : true;
        if (!selIsOneNode) {
            let anchorHierarchy = this.getNodeHierarchy(sel.anchorNode, rootNode).reverse();
            let focusHierarchy = this.getNodeHierarchy(sel.focusNode, rootNode).reverse();
            commonNode = this.getCommonNode(anchorHierarchy, focusHierarchy);
            reverseSelection = this.isReverseSelection(anchorHierarchy, focusHierarchy, commonNode);
        }
        let selAdj = {
            startNode: reverseSelection ? sel.focusNode : sel.anchorNode,
            startOffset: reverseSelection ? sel.focusOffset : sel.anchorOffset,
            endNode: reverseSelection ? sel.anchorNode : sel.focusNode,
            endOffset: reverseSelection ? sel.anchorOffset : sel.focusOffset,
            commonNode: commonNode
        };
        // Fix situation when selection is out of root node.
        let startEndNodeUpdated = false;
        if (!this.isChildOrGrandChild(selAdj.startNode, rootNode)) {
            selAdj.startNode = this.getLastLeftChild(rootNode);
            selAdj.startOffset = 0;
            startEndNodeUpdated = true;
        }
        if (!this.isChildOrGrandChild(selAdj.endNode, rootNode)) {
            const endNode = this.getLastRightChild(rootNode);
            selAdj.endNode = endNode;
            selAdj.endOffset = endNode.textContent ? endNode.textContent.length : 0;
            startEndNodeUpdated = true;
        }
        if (startEndNodeUpdated) {
            if (selIsOneNode && sel.anchorOffset === sel.focusOffset) {
                return;
            }
            commonNode = selAdj.startNode.parentNode ? selAdj.startNode.parentNode : selAdj.startNode;
            if (!selIsOneNode) {
                let anchorHierarchy = this.getNodeHierarchy(selAdj.startNode, rootNode).reverse();
                let focusHierarchy = this.getNodeHierarchy(selAdj.endNode, rootNode).reverse();
                commonNode = this.getCommonNode(anchorHierarchy, focusHierarchy);
                selAdj.commonNode = commonNode;
            }
        }
        // Check if selection is on the middle of some node.
        // If yes, then that node should be splitted in order to be able to apply style
        // only on part of node.
        if (selAdj.startOffset != 0 || (selAdj.endOffset != selAdj.endNode.textContent?.length && selAdj.endOffset != 0)) {
            selAdj.startNode = this.splitStart(selAdj.startNode, selAdj.startOffset);
            // If whole selection rage is in same node.
            if (selIsOneNode) {
                selAdj.endNode = this.splitEnd(selAdj.startNode, selAdj.endOffset - selAdj.startOffset);
                selAdj.startNode = selAdj.endNode;
            }
            else {
                selAdj.endNode = this.splitEnd(selAdj.endNode, selAdj.endOffset);
            }
            selAdj.startOffset = 0;
            selAdj.endOffset = selAdj.endNode.textContent ? selAdj.endNode.textContent.length : 0;
        }
        this.setStyle(selAdj);
        // Create new range and apply it to selection
        const selRange = document.createRange();
        selRange.setStart(selAdj.startNode, selAdj.startOffset);
        selRange.setEnd(selAdj.endNode, selAdj.endOffset);
        sel?.removeAllRanges();
        sel?.addRange(selRange);
        let rootP = document.getElementById("txt-root");
        const nodeReplacement = rootP ? (0, OptimyzeDOM_1.optimyzeNode)(rootP) : null;
        if (rootP && nodeReplacement) {
            rootP.parentNode?.replaceChild(nodeReplacement, rootP);
        }
        this.setBold = !this.setBold;
    }
    setStyle(selection) {
        // If start and end nendNodeode are the same - selection in one node.
        if (selection.startNode.isSameNode(selection.endNode)) {
            this.updateNodeStyle(selection.startNode);
            return;
        }
        const rootAnchor = this.setStyleFromAnchor(selection.startNode, selection.commonNode);
        const rootFocus = this.setStyleFromFocus(selection.endNode, selection.commonNode);
        let node = rootAnchor?.nextSibling;
        while (node && !node.isSameNode(rootFocus)) {
            this.updateNodeStyle(node);
            this.resetChildrenStyle(node);
            node = node.nextSibling;
        }
    }
    updateNodeStyle(nd) {
        const el = nd;
        // If node has style property then style can be changed directly
        if (el.style) {
            if (this.setBold) {
                el.style.fontWeight = "bold";
            }
            else
                el.style.fontWeight = "normal";
        }
        // Case when target node is the text node and it's the only node in parent node.
        // In this case it should be safe to change parent style.
        else if (nd.parentNode?.childNodes.length === 1 && nd.parentNode?.style) {
            this.updateNodeStyle(nd.parentNode);
            // Case when target node is the text node but it's NOT the only node in parent node.
            // So text node should be replaces with span in order to set style of this part of text.
        }
        else {
            const ndSpan = document.createElement("span");
            ndSpan.textContent = nd.textContent;
            this.updateNodeStyle(ndSpan);
            nd.parentNode?.replaceChild(ndSpan, nd);
            return ndSpan;
        }
        return nd;
    }
    resetChildrenStyle(nd) {
        nd.childNodes.forEach(ndChild => {
            const el = ndChild;
            if (el.style) {
                el.style.fontWeight = "";
            }
            this.resetChildrenStyle(ndChild);
        });
    }
    splitStart(nd, offset) {
        if (!nd.textContent || offset === 0) {
            return nd;
        }
        const textContent = nd.textContent;
        //1. clone anchor node
        let ndClone = document.createElement("span");
        //2. remove first part from original
        nd.textContent = textContent ? textContent.substring(0, offset) : null;
        //3. remove second part from copy
        ndClone.textContent = textContent ? textContent.substring(offset) : null;
        //4. insert copy before original
        if (nd.parentNode) {
            if (nd.nextSibling) {
                ndClone = nd.parentNode.insertBefore(ndClone, nd.nextSibling);
            }
            else {
                ndClone = nd.parentNode.appendChild(ndClone);
            }
        }
        else {
            console.log("wrong start element");
        }
        return ndClone.childNodes[0];
    }
    splitEnd(nd, offset) {
        if (!nd.textContent || offset === nd.textContent.length) {
            return nd;
        }
        const textContent = nd.textContent;
        //1. clone anchor node
        let ndClone = document.createElement("span");
        //2. remove first part from original
        nd.textContent = textContent.substring(offset);
        //3. remove second part from copy
        ndClone.textContent = textContent.substring(0, offset);
        //4. insert copy before original
        if (nd.parentNode) {
            ndClone = nd.parentNode.insertBefore(ndClone, nd);
        }
        else {
            console.log("wrong end element");
        }
        return ndClone.childNodes[0];
    }
    setStyleFromAnchor(nd, commonNode) {
        const rootNode = document.getElementById(this.containerId);
        let currentNode = nd;
        if (!currentNode) {
            return nd;
        }
        let prevNode = currentNode;
        currentNode = this.updateNodeStyle(currentNode);
        do {
            if (currentNode.nextSibling) {
                if (currentNode?.parentNode?.isSameNode(commonNode)) {
                    return currentNode;
                }
                currentNode = currentNode.nextSibling;
                currentNode = this.updateNodeStyle(currentNode);
                this.resetChildrenStyle(currentNode);
            }
            else {
                prevNode = currentNode;
                currentNode = currentNode.parentNode;
            }
        } while (currentNode && !currentNode.isSameNode(commonNode) && !currentNode.isSameNode(rootNode));
        return prevNode;
    }
    setStyleFromFocus(nd, commonNode) {
        const rootNode = document.getElementById(this.containerId);
        let currentNode = nd;
        if (!currentNode) {
            return nd;
        }
        let prevNode = currentNode;
        currentNode = this.updateNodeStyle(currentNode);
        do {
            if (currentNode.previousSibling) {
                if (currentNode?.parentNode?.isSameNode(commonNode)) {
                    return currentNode;
                }
                currentNode = currentNode.previousSibling;
                currentNode = this.updateNodeStyle(currentNode);
                this.resetChildrenStyle(currentNode);
            }
            else {
                prevNode = currentNode;
                currentNode = currentNode.parentNode;
            }
        } while (currentNode && !currentNode.isSameNode(commonNode) && !currentNode.isSameNode(rootNode));
        return prevNode;
    }
    getIndex(nd, startOffset, rootNode) {
        if (!nd?.parentElement) {
            return;
        }
        ;
        let currentNode = nd;
        let index = 0;
        let prevNode;
        let content = [];
        while (true) {
            prevNode = currentNode;
            currentNode = currentNode.parentNode;
            let nodeList = currentNode.childNodes;
            for (let i = 0; i < nodeList.length; i++) {
                const childNode = nodeList[i];
                if (childNode?.textContent && childNode.childNodes.length === 0) {
                    content.push(childNode?.textContent);
                }
                if (childNode === nd) {
                    index += startOffset;
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
    isReverseSelection(anchorHierarchy, focusHierarchy, commonNode) {
        const maxDepth = Math.min(anchorHierarchy.length, focusHierarchy.length);
        let commonNodeDepth = 0;
        for (let depth = 0; depth < maxDepth; depth++) {
            if (commonNode.isSameNode(anchorHierarchy[depth])) {
                commonNodeDepth = depth;
            }
        }
        for (let i = 0; i < commonNode.childNodes.length; i++) {
            const nd = commonNode.childNodes[i];
            if (nd.isSameNode(anchorHierarchy[commonNodeDepth + 1])) {
                return false;
            }
            if (nd.isSameNode(focusHierarchy[commonNodeDepth + 1])) {
                return true;
            }
        }
        return false;
    }
    getCommonNode(anchorHierarchy, focusHierarchy) {
        const maxDepth = Math.min(anchorHierarchy.length, focusHierarchy.length);
        for (let depth = 1; depth < maxDepth; depth++) {
            if (!anchorHierarchy[depth].isSameNode(focusHierarchy[depth])) {
                return anchorHierarchy[depth - 1];
            }
        }
        return anchorHierarchy[maxDepth - 1];
    }
    getNodeHierarchy(nd, rootNode) {
        let nodeHierarchy = [nd];
        while (nd.parentNode && !nd.isSameNode(rootNode)) {
            nd = nd.parentNode;
            nodeHierarchy.push(nd);
        }
        return nodeHierarchy;
    }
    createSpan(spanId) {
        const spanEl = document.createElement("span");
        spanEl.contentEditable = "true";
        spanEl.id = `txt-sp-${spanId}`;
        spanEl.innerText = "span" + spanId;
        spanEl.classList.add("text-span");
        return spanEl;
    }
}
exports.Editor = Editor;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
// Add tab handling
const Tools_1 = require("./ToolsPanel/Tools");
const SelectionAdj_1 = require("./SelectionAdj");
const Styling_1 = require("./Styling");
const DOMTools_1 = require("./DOMTools");
class Editor {
    fieldId;
    elements;
    containerId;
    tools;
    constructor(divId) {
        this.setStyleFromObj = this.setStyleFromObj.bind(this);
        this.selectionChanged = this.selectionChanged.bind(this);
        const rootEl = document.getElementById(divId);
        if (rootEl) {
            rootEl.innerHTML = '';
        }
        const toolsNd = document.createElement("div");
        this.tools = new Tools_1.Tools(toolsNd, this.setStyleFromObj);
        rootEl?.appendChild(toolsNd);
        this.fieldId = 0;
        this.containerId = divId;
        const editrNd = document.createElement("div");
        rootEl?.appendChild(editrNd);
        const rootP = this.createRootTextElement();
        this.elements = {
            [this.fieldId]: this.createSpan(this.fieldId)
        };
        this.fieldId += 1;
        this.elements[0].appendChild(this.createSpan(10));
        editrNd?.appendChild(rootP);
        rootP?.appendChild(this.elements[0]);
        rootP?.appendChild(this.createSpan(2));
        editrNd.addEventListener('mouseup', this.selectionChanged);
    }
    selectionChanged(ev) {
        console.log('mouseup handler');
        const selAdj = this.getAdjSelection(false);
        console.log(selAdj, selAdj?.startOffset, selAdj?.endOffset);
        if (selAdj) {
            const style = (0, Styling_1.getNestedStyle)(selAdj);
            console.log(style);
            this.tools.silentUpdate(style);
            /*
            if (selAdj.isEmpty) {
                const insertedNode = this.insertEmptySpan(selAdj.startNode, selAdj.startOffset);
                const sel = window.getSelection();
                
                const selRange = document.createRange();
                const next = insertedNode.nextSibling ? insertedNode.nextSibling : insertedNode;
                selRange.setStart(next, 1);
                selRange.setEnd(next, 1);
                //selRange.selectNodeContents(insertedNode);
                //selRange.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(selRange);
                document.getElementById("txt-root")?.focus();
                
                console.log(sel)
                
                
                 
            }
            */
        }
    }
    createRootTextElement() {
        const firstTextEl = document.createElement("p");
        firstTextEl.contentEditable = "true";
        firstTextEl.id = "txt-root";
        firstTextEl.innerText = "template";
        firstTextEl.style["display"] = "inline-block";
        firstTextEl.style["padding"] = "10px";
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
    getAdjSelection(splitNodes = false) {
        let sel = window.getSelection();
        let rootNode = document.getElementById(this.containerId);
        let rootP = document.getElementById("txt-root");
        if (!sel || !sel.anchorNode || !sel.focusNode || !rootNode) {
            return;
        }
        const selIsOneNode = sel.anchorNode.isSameNode(sel.focusNode);
        let commonNode = sel.anchorNode.parentNode ? sel.anchorNode.parentNode : sel.anchorNode;
        let reverseSelection = sel.anchorOffset < sel.focusOffset || !selIsOneNode ? false : true;
        if (!selIsOneNode) {
            let anchorHierarchy = (0, DOMTools_1.getNodeHierarchy)(sel.anchorNode, rootNode);
            let focusHierarchy = (0, DOMTools_1.getNodeHierarchy)(sel.focusNode, rootNode);
            commonNode = (0, DOMTools_1.getCommonNode)(anchorHierarchy, focusHierarchy);
            reverseSelection = this.isReverseSelection(anchorHierarchy, focusHierarchy, commonNode);
        }
        console.log("reverse:", reverseSelection, "one node:", selIsOneNode);
        let selAdj = {
            startNode: reverseSelection ? sel.focusNode : sel.anchorNode,
            startOffset: reverseSelection ? sel.focusOffset : sel.anchorOffset,
            endNode: reverseSelection ? sel.anchorNode : sel.focusNode,
            endOffset: reverseSelection ? sel.anchorOffset : sel.focusOffset,
            commonNode: commonNode,
            isEmpty: (selIsOneNode && sel.anchorOffset === sel.focusOffset)
        };
        if (selAdj.isEmpty) {
            return selAdj;
        }
        selAdj.startIndex = this.getIndex(selAdj.startNode, selAdj.startOffset, rootP);
        selAdj.endIndex = this.getIndex(selAdj.endNode, selAdj.endOffset, rootP);
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
                let anchorHierarchy = (0, DOMTools_1.getNodeHierarchy)(selAdj.startNode, rootNode);
                let focusHierarchy = (0, DOMTools_1.getNodeHierarchy)(selAdj.endNode, rootNode);
                commonNode = (0, DOMTools_1.getCommonNode)(anchorHierarchy, focusHierarchy);
                selAdj.commonNode = commonNode;
            }
        }
        if (!splitNodes)
            return (0, SelectionAdj_1.fixSelectionEnd)(selAdj);
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
        return (0, SelectionAdj_1.fixSelectionEnd)(selAdj);
    }
    setStyleFromObj(newStyle) {
        let selAdj = this.getAdjSelection(true);
        if (selAdj) {
            if (!selAdj.isEmpty) {
                console.log("selection is not empty");
                (0, Styling_1.setStyle)(selAdj, newStyle);
            }
            else {
                let cursorNd = selAdj.startNode;
                if (cursorNd.textContent != undefined && cursorNd.textContent !== "\u200b") {
                    cursorNd = this.insertEmptySpan(selAdj.startNode, selAdj.startOffset);
                    console.log("cursor nd", cursorNd.textContent?.charCodeAt(0), cursorNd.textContent === "\u200b");
                }
                const sel = window.getSelection();
                console.log("setting style for empty span");
                (0, Styling_1.updateNodeStyle)(cursorNd, newStyle);
                if (!sel) {
                    return;
                }
                sel.collapse(cursorNd, 1);
            }
        }
    }
    splitStart(nd, offset) {
        if (nd.nodeType !== Node.TEXT_NODE) {
            console.error("splitStart accepts only text nodes, not ", nd.nodeType);
            return nd;
        }
        if (!nd.textContent || offset === 0) {
            return nd;
        }
        const textContent = nd.textContent;
        //1. clone anchor node
        let ndInsert = document.createElement("span");
        const ndText = document.createTextNode("");
        ndInsert.appendChild(ndText);
        //2. remove first part from original
        nd.textContent = textContent ? textContent.substring(0, offset) : null;
        //3. remove second part from copy
        ndInsert.textContent = textContent ? textContent.substring(offset) : null;
        //4. insert copy before original
        if (nd.parentNode) {
            if (nd.nextSibling) {
                ndInsert = nd.parentNode.insertBefore(ndInsert, nd.nextSibling);
            }
            else {
                ndInsert = nd.parentNode.appendChild(ndInsert);
            }
        }
        else {
            console.log("wrong start element");
        }
        return ndInsert.childNodes[0];
    }
    splitEnd(nd, offset) {
        if (nd.nodeType !== Node.TEXT_NODE) {
            console.error("splitEnd accepts only text nodes, not ", nd.nodeType);
            return nd;
        }
        if (!nd.textContent || offset === nd.textContent.length) {
            return nd;
        }
        console.log(nd.textContent);
        const textContent = nd.textContent;
        //1. clone anchor node
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
        }
        else {
            console.log("wrong end element");
        }
        console.log(ndInsert.textContent, nd.textContent); //fix undefined return
        return ndInsert.childNodes[0];
    }
    // Split node and insert span
    insertEmptySpan(nd, offset) {
        if (nd.nodeType !== Node.TEXT_NODE) {
            console.error("insertEmptySpan accepts only text nodes, not ", nd.nodeType);
            return nd;
        }
        // if it's already empty node - no need to insert another one.
        if (!nd.textContent && !nd.previousSibling && !nd.nextSibling) {
            return nd;
        }
        if (!nd.parentNode) {
            return nd;
        }
        const ndInsert = document.createElement("span");
        const ndText = document.createTextNode("\u200b");
        ndInsert.appendChild(ndText);
        if (offset === 0) {
            nd.parentNode.insertBefore(ndInsert, nd);
            return ndText;
        }
        // Append empty node at the end
        if (nd.nextSibling) {
            nd.parentNode.insertBefore(ndInsert, nd.nextSibling);
        }
        else {
            nd.parentNode.appendChild(ndInsert);
        }
        if (nd.textContent && offset < nd.textContent.length) {
            const textContent = nd.textContent;
            nd.textContent = textContent.substring(0, offset);
            const textEnd = document.createTextNode(textContent.substring(offset));
            if (ndInsert.nextSibling) {
                nd.parentNode.insertBefore(textEnd, ndInsert.nextSibling);
            }
            else {
                nd.parentNode.appendChild(textEnd);
            }
        }
        return ndText;
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

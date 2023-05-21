"use strict";
// Add tab handling
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
class Editor {
    fieldId;
    elements;
    containerId;
    constructor(divId) {
        const rootEl = document.getElementById(divId);
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
        this.settingsChanged = this.settingsChanged.bind(this);
        rootEl?.addEventListener("mouseup", (event) => { this.settingsChanged(); });
    }
    createRootTextElement() {
        const firstTextEl = document.createElement("p");
        firstTextEl.contentEditable = "true";
        firstTextEl.id = "txt-root";
        firstTextEl.innerText = "template";
        firstTextEl.classList.add("text-box");
        return firstTextEl;
    }
    settingsChanged() {
        const sel = window.getSelection();
        if (!sel) {
            return;
        }
        const startIndex = this.getIndex(sel.anchorNode, sel.anchorOffset);
        const endIndex = this.getIndex(sel.focusNode, sel.focusOffset);
        if (!startIndex || !endIndex) {
            console.log("Index err:", startIndex, endIndex);
            return;
        }
        console.log("START INDEX: ", Math.min(startIndex, endIndex));
        console.log("END INDEX: ", Math.max(startIndex, endIndex));
    }
    getIndex(node, startOffset) {
        if (!node?.parentElement) {
            return;
        }
        ;
        let pNode = node;
        let index = 0;
        let prevPNode;
        while (true) {
            prevPNode = pNode;
            pNode = pNode.parentNode;
            let nodeList = pNode.childNodes;
            console.log("Parent", pNode, nodeList);
            for (let i = 0; i < nodeList.length; i++) {
                const chNode = nodeList[i];
                if (chNode == node) {
                    index += startOffset;
                    break;
                }
                else if (chNode == prevPNode) {
                    break;
                }
                if (chNode?.textContent) {
                    index += chNode?.textContent.length;
                }
            }
            if (pNode?.parentElement?.id === this.containerId || pNode?.parentElement?.tagName === 'DIV') {
                return index;
            }
        }
    }
    getSelectionRange() {
        const sel = window.getSelection();
        if (!sel) {
            return;
        }
        const startIndex = this.getIndex(sel.anchorNode, sel.anchorOffset);
        const endIndex = this.getIndex(sel.focusNode, sel.focusOffset);
        if (!startIndex || !endIndex) {
            return;
        }
        return [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
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

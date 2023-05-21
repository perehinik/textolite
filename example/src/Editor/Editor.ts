// Add tab handling

export class Editor {
    fieldId: number;
    elements: { [name: number]: HTMLElement };
    containerId: string;

    constructor(divId: string) {
        const rootEl = document.getElementById(divId);
        this.fieldId = 0;
        this.containerId = divId;

        const rootP = this.createRootTextElement();
        this.elements = {
            [this.fieldId]: this.createSpan(this.fieldId) 
        };
        this.fieldId += 1;
        
        this.elements[0].appendChild(this.createSpan(10))

        rootEl?.appendChild(rootP);
        rootP?.appendChild(this.elements[0]);
        rootP?.appendChild(this.createSpan(2))


        this.settingsChanged = this.settingsChanged.bind(this);

        rootEl?.addEventListener("mouseup", (event) => {this.settingsChanged()});
    }

    createRootTextElement() {
        const firstTextEl: HTMLParagraphElement = document.createElement("p");
        firstTextEl.contentEditable = "true";
        firstTextEl.id = "txt-root";
        firstTextEl.innerText = "template";
        firstTextEl.classList.add("text-box");

        return firstTextEl;
    }

    
    settingsChanged() {
        const sel = window.getSelection();
        if (!sel) {return;}
        const startIndex = this.getIndex(sel.anchorNode, sel.anchorOffset);
        const endIndex = this.getIndex(sel.focusNode, sel.focusOffset);
        if (!startIndex || ! endIndex) {
            console.log("Index err:", startIndex, endIndex)
            return;
        }
        console.log("START INDEX: ", Math.min(startIndex, endIndex));
        console.log("END INDEX: ", Math.max(startIndex, endIndex));
    }

    getIndex(node: Node | null, startOffset: number) : number | undefined{
        if (!node?.parentElement ) {return;};

        let pNode = node;
        let index = 0;
        let prevPNode : Node;

        while (true) {
            prevPNode = pNode
            pNode = pNode.parentNode as Node;
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
        if (!sel) {return;}
        const startIndex = this.getIndex(sel.anchorNode, sel.anchorOffset);
        const endIndex = this.getIndex(sel.focusNode, sel.focusOffset);
        if (!startIndex || !endIndex) {return;}
        return [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)]
    }

    createSpan(spanId: number) {
        const spanEl: HTMLElement = document.createElement("span");
        spanEl.contentEditable = "true";
        spanEl.id = `txt-sp-${spanId}`;
        spanEl.innerText = "span" + spanId;
        spanEl.classList.add("text-span");

        return spanEl;
    }
}
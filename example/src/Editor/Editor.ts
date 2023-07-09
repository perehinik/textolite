// Add tab handling
import { optimyzeNode } from './OptimyzeDOM';
import { Tools } from './ToolsPanel/Tools';
import { SelectionAdj } from './SelectionAdj';
import { restoreSelection, fixSelectionEnd } from './SelectionAdj';
import { setStyle, CSSObj, getNestedStyle } from './Styling';
import { getNodeHierarchy, getCommonNode } from './DOMTools';


export class Editor {
    fieldId: number;
    elements: { [name: number]: HTMLElement };
    containerId: string;
    tools: Tools;

    constructor(divId: string) {
        this.setStyleFromObj = this.setStyleFromObj.bind(this);

        const rootEl = document.getElementById(divId);
        if (rootEl){rootEl.innerHTML = '';}

        const toolsNd = document.createElement("div");
        this.tools = new Tools(toolsNd, this.setStyleFromObj);
        rootEl?.appendChild(toolsNd);

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
    }

    createRootTextElement(): HTMLParagraphElement {
        const firstTextEl: HTMLParagraphElement = document.createElement("p");
        firstTextEl.contentEditable = "true";
        firstTextEl.id = "txt-root";
        firstTextEl.innerText = "template";
        firstTextEl.classList.add("text-box");

        return firstTextEl;
    }

    isChildOrGrandChild(childNode: Node, parentNode: Node): boolean {
        let pNd = childNode.parentNode;
        while (pNd) {
            if (pNd.isSameNode(parentNode)) {return true;}
            pNd = pNd.parentNode;
        }
        return false;
    }

    getLastLeftChild(nd: Node): Node{
        while (nd.childNodes.length > 0 && nd.childNodes[0].textContent) {
            nd = nd.childNodes[0]
        }
        return nd;
    }

    getLastRightChild(nd: Node): Node{
        while (nd.childNodes.length > 0 && nd.childNodes[nd.childNodes.length - 1].textContent) {
            nd = nd.childNodes[nd.childNodes.length - 1]
        }
        return nd;
    }

    getAdjSelection(splitNodes: boolean = false): SelectionAdj | undefined {
        let sel = window.getSelection();
        let rootNode = document.getElementById(this.containerId);
        let rootP = document.getElementById("txt-root");
        if (!sel || !sel.anchorNode || !sel.focusNode || !rootNode) {return;}

        const selIsOneNode = sel.anchorNode.isSameNode(sel.focusNode);

        let commonNode = sel.anchorNode.parentNode ? sel.anchorNode.parentNode : sel.anchorNode;
        let reverseSelection = sel.anchorOffset < sel.focusOffset || selIsOneNode ? false : true;

        if (!selIsOneNode) {
            let anchorHierarchy = getNodeHierarchy(sel.anchorNode, rootNode);
            let focusHierarchy = getNodeHierarchy(sel.focusNode, rootNode);
            commonNode = getCommonNode(anchorHierarchy, focusHierarchy);
            reverseSelection = this.isReverseSelection(anchorHierarchy, focusHierarchy, commonNode);
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

        selAdj.startIndex = this.getIndex(selAdj.startNode, selAdj.startOffset, rootP as Node);
        selAdj.endIndex = this.getIndex(selAdj.endNode, selAdj.endOffset, rootP as Node);

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
            if (selIsOneNode && sel.anchorOffset === sel.focusOffset) {return;}

            commonNode = selAdj.startNode.parentNode ? selAdj.startNode.parentNode : selAdj.startNode;

            if (!selIsOneNode) {
                let anchorHierarchy = getNodeHierarchy(selAdj.startNode, rootNode);
                let focusHierarchy = getNodeHierarchy(selAdj.endNode, rootNode);
                commonNode = getCommonNode(anchorHierarchy, focusHierarchy);
                selAdj.commonNode = commonNode;
            }
        }

        if (!splitNodes) return fixSelectionEnd(selAdj);

        // Check if selection is on the middle of some node.
        // If yes, then that node should be splitted in order to be able to apply style
        // only on part of node.
        if (selAdj.startOffset != 0 || (selAdj.endOffset != selAdj.endNode.textContent?.length && selAdj.endOffset != 0)) {
            selAdj.startNode = this.splitStart(selAdj.startNode, selAdj.startOffset);
            
            // If whole selection rage is in same node.
            if (selIsOneNode) {
                selAdj.endNode = this.splitEnd(selAdj.startNode, selAdj.endOffset - selAdj.startOffset)
                selAdj.startNode = selAdj.endNode;
            } else {
                selAdj.endNode = this.splitEnd(selAdj.endNode, selAdj.endOffset);
            }
            selAdj.startOffset = 0;
            selAdj.endOffset = selAdj.endNode.textContent ? selAdj.endNode.textContent.length : 0;
        }

        return fixSelectionEnd(selAdj);
    }

    setStyleFromObj(newStyle: CSSObj) {
        let selAdj = this.getAdjSelection(true);
        if (selAdj && !selAdj.isEmpty) {
            setStyle(selAdj, newStyle);
        }
        selAdj = this.getAdjSelection();
        if (selAdj) {
            console.log(getNestedStyle(selAdj));
            if (selAdj.isEmpty) {
                restoreSelection(
                    selAdj.startNode, 
                    selAdj.startOffset, 
                    selAdj.endOffset
                );
            }
        }
        //ToDo IP: Modify selAdj and dependencies to handle empty selections
    }

    splitStart(nd: Node, offset: number): Node {
        if (!nd.textContent || offset === 0) {return nd;}
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
            } else {
                ndClone = nd.parentNode.appendChild(ndClone);
            }
        } else {
            console.log("wrong start element");
        }
        return ndClone.childNodes[0];
    }

    splitEnd(nd: Node, offset: number): Node {
        if (!nd.textContent || offset === nd.textContent.length) {return nd;}
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
        } else {
            console.log("wrong end element");
        }
        return ndClone.childNodes[0];
    }

    getIndex(nd: Node | null, startOffset: number, rootNode: Node) : number | undefined {
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
    
    isReverseSelection(anchorHierarchy: Node[], focusHierarchy: Node[], commonNode: Node) : boolean {
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

    createSpan(spanId: number): HTMLElement {
        const spanEl: HTMLElement = document.createElement("span");
        spanEl.contentEditable = "true";
        spanEl.id = `txt-sp-${spanId}`;
        spanEl.innerText = "span" + spanId;
        spanEl.classList.add("text-span");

        return spanEl;
    }
}
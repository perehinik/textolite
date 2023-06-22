// Add tab handling
import { optimyzeNode } from './OptimyzeDOM';
import { Tools } from './ToolsPanel/Tools';

type SelectionAdj = {
    startNode: Node,
    startOffset: number,
    endNode: Node,
    endOffset: number,
    commonNode: Node,
    startIndex?: number,
    endIndex?: number
};

type Position = {
    node: Node,
    offset: number
};

export class Editor {
    fieldId: number;
    elements: { [name: number]: HTMLElement };
    containerId: string;
    tools: Tools;

    setBold: boolean;

    constructor(divId: string) {
        this.setStyle = this.setStyle.bind(this);
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

        //this.settingsChanged = this.settingsChanged.bind(this);

        this.setBold = true;
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

    getAdjSelection(): SelectionAdj | undefined {
        let sel = window.getSelection();
        let rootNode = document.getElementById(this.containerId);
        let rootP = document.getElementById("txt-root");
        if (!sel || !sel.anchorNode || !sel.focusNode || !rootNode) {return;}

        const selIsOneNode = sel.anchorNode.isSameNode(sel.focusNode);
        // selection is empty
        if (selIsOneNode && sel.anchorOffset === sel.focusOffset) {return;}

        let commonNode = sel.anchorNode.parentNode ? sel.anchorNode.parentNode : sel.anchorNode;
        let reverseSelection = sel.anchorOffset < sel.focusOffset ? false : true;

        if (!selIsOneNode) {
            let anchorHierarchy = this.getNodeHierarchy(sel.anchorNode, rootNode).reverse();
            let focusHierarchy = this.getNodeHierarchy(sel.focusNode, rootNode).reverse();
            commonNode = this.getCommonNode(anchorHierarchy, focusHierarchy);
            reverseSelection = this.isReverseSelection(anchorHierarchy, focusHierarchy, commonNode);
        }

        let selAdj: SelectionAdj = {
            startNode: reverseSelection ? sel.focusNode : sel.anchorNode,
            startOffset: reverseSelection ? sel.focusOffset : sel.anchorOffset,
            endNode: reverseSelection ? sel.anchorNode : sel.focusNode,
            endOffset: reverseSelection ? sel.anchorOffset : sel.focusOffset,
            commonNode: commonNode
        };

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
                selAdj.endNode = this.splitEnd(selAdj.startNode, selAdj.endOffset - selAdj.startOffset)
                selAdj.startNode = selAdj.endNode;
            } else {
                selAdj.endNode = this.splitEnd(selAdj.endNode, selAdj.endOffset);
            }
            selAdj.startOffset = 0;
            selAdj.endOffset = selAdj.endNode.textContent ? selAdj.endNode.textContent.length : 0;
        }
        return selAdj;
    }

    restoreSelection(nd: Node, startIndex: number, endIndex: number): void {
        let sel = window.getSelection();
        const startNd = this.getChildNodeByIndex(nd, startIndex);
        const endNd = this.getChildNodeByIndex(nd, endIndex);

        const selRange = document.createRange();
        selRange.setStart(startNd.node, startNd.offset);
        selRange.setEnd(endNd.node, endNd.offset);
        sel?.removeAllRanges();
        sel?.addRange(selRange);
    }

    setStyleFromObj(newStyle: { [name: string]: string }) {
        for(let key in newStyle) {
            this.setStyle(key, newStyle[key]);
        }
    }

    setStyle(key: string, value: string): void {
        let rootP = document.getElementById("txt-root");
        let selAdj = this.getAdjSelection();
        if (!selAdj) {return;}

        // If start and end nendNodeode are the same - selection in one node.
        if (selAdj.startNode.isSameNode(selAdj.endNode)) {
            this.updateNodeStyle(selAdj.startNode, key, value);
            return;
        }
        const rootAnchor = this.setStyleFromAnchor(selAdj.startNode, selAdj.commonNode, key, value);
        const rootFocus = this.setStyleFromFocus(selAdj.endNode, selAdj.commonNode, key, value);
        let node = rootAnchor?.nextSibling
        while(node && !node.isSameNode(rootFocus)) {
            this.updateNodeStyle(node, key, value);
            this.resetChildrenStyle(node);
            node = node.nextSibling;
        }

        // Optimize DOM structure after style update
        const nodeReplacement = rootP ? optimyzeNode(rootP) : null;
        if (rootP && nodeReplacement) {
            rootP.parentNode?.replaceChild(nodeReplacement, rootP)
        }
        
        // Because DOM structure may have been changed we need to update selection range
        this.restoreSelection(
            nodeReplacement as Node, 
            selAdj.startIndex ? selAdj.startIndex : 0, 
            selAdj.endIndex ? selAdj.endIndex : 0
            );

        this.setBold = !this.setBold;
    }

    updateNodeStyle(nd: Node, key: string, value: string) : Node {
        const el = nd as HTMLElement;
        // If node has style property then style can be changed directly
        if (el.style) {
            el.style.setProperty(key, value);
        }
        // Case when target node is the text node and it's the only node in parent node.
        // In this case it should be safe to change parent style.
        else if (nd.parentNode?.childNodes.length === 1 && (nd.parentNode as HTMLElement)?.style) {
            this.updateNodeStyle(nd.parentNode, key, value);
        // Case when target node is the text node but it's NOT the only node in parent node.
        // So text node should be replaces with span in order to set style of this part of text.
        } else {
            const ndSpan = document.createElement("span");
            ndSpan.textContent = nd.textContent;
            this.updateNodeStyle(ndSpan, key, value)
            nd.parentNode?.replaceChild(ndSpan, nd)
            return ndSpan;
        }
        return nd;
    }

    resetChildrenStyle(nd: Node) : void{
        nd.childNodes.forEach(ndChild => {
            const el = ndChild as HTMLElement;
            if (el.style) { el.style.fontWeight = "";}
            this.resetChildrenStyle(ndChild);
        })
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

    setStyleFromAnchor(nd: Node, commonNode: Node, key: string, value: string): Node | undefined {
        const rootNode = document.getElementById(this.containerId);
        let currentNode = nd;
        if (!currentNode) {return nd;}
        let prevNode: Node = currentNode;

        currentNode = this.updateNodeStyle(currentNode, key, value)

        do {
            if (currentNode.nextSibling) {
                if (currentNode?.parentNode?.isSameNode(commonNode)) {return currentNode;}
                currentNode = currentNode.nextSibling as Node;
                currentNode = this.updateNodeStyle(currentNode, key, value);
                this.resetChildrenStyle(currentNode);
            }
            else {
                prevNode = currentNode;
                currentNode = currentNode.parentNode as Node;
            }
        } while (currentNode && !currentNode.isSameNode(commonNode) && !currentNode.isSameNode(rootNode))

        return prevNode;
    }

    setStyleFromFocus(nd: Node, commonNode: Node, key: string, value: string): Node {
        const rootNode = document.getElementById(this.containerId);
        let currentNode = nd
        if (!currentNode) {return nd;}
        let prevNode: Node = currentNode;

        currentNode = this.updateNodeStyle(currentNode, key, value)

        do {
            if (currentNode.previousSibling) {
                if (currentNode?.parentNode?.isSameNode(commonNode)) {return currentNode;}
                currentNode = currentNode.previousSibling as Node;
                currentNode = this.updateNodeStyle(currentNode, key, value)
                this.resetChildrenStyle(currentNode);
            }
            else {
                prevNode = currentNode;
                currentNode = currentNode.parentNode as Node;
            }
        } while (currentNode && !currentNode.isSameNode(commonNode) && !currentNode.isSameNode(rootNode))

        return prevNode;
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

    getChildNodeByIndex(nd: Node, index: number): Position {
        if (nd.childNodes?.length) {
            for (let i=0; i < nd.childNodes.length; i++) {
                const chNd = nd.childNodes[i];
                const txtLength = chNd?.textContent?.length;
                if (!txtLength) { continue; }
                // Second condition is to eliminate situation when start position
                // is at the end of the node. In this case selection should start at the next node. 
                if (index < txtLength || (i+1 === nd.childNodes.length && index === txtLength)) { 
                    return this.getChildNodeByIndex(chNd, index);
                }
                index -= txtLength;
            }
        }
        return {node: nd, offset: index} as Position;
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

    getCommonNode(anchorHierarchy: Node[], focusHierarchy: Node[]) : Node {
        const maxDepth = Math.min(anchorHierarchy.length, focusHierarchy.length)

        for (let depth=1; depth<maxDepth; depth++) {
            if (!anchorHierarchy[depth].isSameNode(focusHierarchy[depth])) {
                return anchorHierarchy[depth-1]
            }
        }
        return anchorHierarchy[maxDepth-1]
    }

    getNodeHierarchy(nd: Node, rootNode: Node): Node[] {
        let nodeHierarchy: Node[] = [nd] 
        while(nd.parentNode && !nd.isSameNode(rootNode)) {
            nd = nd.parentNode;
            nodeHierarchy.push(nd);
        }
        return nodeHierarchy;
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
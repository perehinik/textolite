// Add tab handling
import { Tools } from './ToolsPanel/Tools';
import { SelectionAdj, getAdjSelection, setSelection } from './SelectionAdj';
import { setStyle, CSSObj, getNestedStyle, updateNodeStyle, defaultStyle } from './Styling';
import { insertAfter, getPreviousSiblingWithText } from './DOMTools';

import { optimizeNode } from './OptimyzeDOM';
import { restoreSelection } from "./SelectionAdj";


export class Editor {
    editorContainer: HTMLElement;
    containerId: string;
    toolsDivId: string;
    editorDivId: string;
    tools: Tools;
    emptyNodes: Node[] = [];

    constructor(divId?: string) {
        this.setStyleFromObj = this.setStyleFromObj.bind(this);
        this.selectionChanged = this.selectionChanged.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.updateToolboxStyleFromSelection = this.updateToolboxStyleFromSelection.bind(this);
        this.removeEmptyNodes = this.removeEmptyNodes.bind(this);

        this.editorContainer = this.getEditorRootNode(divId);
        
        this.containerId = this.editorContainer.id;
        this.toolsDivId = this.containerId + "-tools";
        this.editorDivId = this.containerId + "-editor";

        const toolsNd = this.createToolboxContainer();
        this.tools = new Tools(toolsNd, this.setStyleFromObj);
        this.editorContainer.appendChild(toolsNd);

        const editrNd = this.createEditorContainer();
        // editorNd might be replaced during editor lifecycle. 
        // Events are not reconnected during replacement. That's why eventNd is needed.
        const eventNd = document.createElement("div");
        eventNd.appendChild(editrNd);
        updateNodeStyle(eventNd, defaultStyle);
        this.editorContainer.appendChild(eventNd);

        const rootP: HTMLElement = document.createElement("P");
        rootP.style.display = "inline-block";
        rootP.textContent = "Hello World! I'm just a simple text editor.";
        editrNd.appendChild(rootP);
        
        eventNd.addEventListener('mouseup', this.selectionChanged);
        eventNd.addEventListener('keyup', this.keyUpHandler);
        eventNd.addEventListener('keyup', this.keyDownHandler);
        eventNd.addEventListener('mousedown', () => {this.removeEmptyNodes(false)});
    }

    getEditorRootNode(divId?: string): HTMLElement {
        let nd: HTMLElement | null = null;
        if (divId) { 
            nd = document.getElementById(divId); 
        } else { 
            divId = 'editor-' + Math.random().toString(36).substring(2); 
        }
        if (!nd) {
            nd = document.createElement("div");
            nd.id = divId;
        }
        nd.innerHTML = "";
        return nd;
    }

    createToolboxContainer(): HTMLDivElement {
        const toolboxDiv: HTMLDivElement = document.createElement("div");
        toolboxDiv.id = this.toolsDivId;
        return toolboxDiv;
    }

    createEditorContainer(): HTMLDivElement {
        const editorDiv: HTMLDivElement = document.createElement("div");
        editorDiv.id = this.editorDivId
        editorDiv.contentEditable = "true";
        editorDiv.style.minHeight = "100px";
        editorDiv.style.display = "inline-block";
        editorDiv.style.padding = "10px";
        editorDiv.style.margin = "5px";
        editorDiv.style.border = "1px solid gray";
        editorDiv.style.outline = "none";
        editorDiv.style.width = "90%";
        editorDiv.style.backgroundColor = "white";
        return editorDiv;
    }


    selectionChanged(ev: MouseEvent) {
        this.updateToolboxStyleFromSelection();
    }


    keyUpHandler(ev: KeyboardEvent) {
        const updateToolboxKeys = ['Backspace', 'ArrowLeft', 'ArrowRight']
        if (updateToolboxKeys.includes(ev.key)) {
            this.removeEmptyNodes(true);
            this.updateToolboxStyleFromSelection();
        }
    }


    keyDownHandler(ev: KeyboardEvent) {
        if (ev.key === "Enter") {
            //document.execCommand
        }
    }


    updateToolboxStyleFromSelection(): void {
        const rootNode = document.getElementById(this.editorDivId) as Node;
        const selAdj = getAdjSelection(false, rootNode);
        if (selAdj) {
            const style = getNestedStyle(selAdj);
            this.tools.silentUpdate(style);
        }
    }


    setStyleFromObj(newStyle: CSSObj) {
        const rootNode = document.getElementById(this.editorDivId) as Node;
        let selAdj = getAdjSelection(true, rootNode);
        if (selAdj) {
            if (!selAdj.isEmpty) {
                this.updateStyleAndOptimyze(rootNode, selAdj, newStyle);
            } else {
                this.setCursorStyle(selAdj, newStyle)
            }
        }
    }


    updateStyleAndOptimyze(rootNode: Node, sel: SelectionAdj, newStyle: CSSObj): void {
        setStyle(sel, newStyle);
        // Optimize DOM structure after style update
        //ToDo IP: this can be upgraded to optimyze only modified nodes, not the whoile editor tree.
        const nodeReplacement = rootNode ? optimizeNode(rootNode, defaultStyle) as HTMLElement : null;

        if (rootNode && rootNode.parentNode && nodeReplacement) {
            rootNode.parentNode.replaceChild(nodeReplacement, rootNode) 
        }
        // Because DOM structure may have been changed we need to update selection range
        restoreSelection(
            nodeReplacement as Node, 
            sel.startIndex ? sel.startIndex : 0, 
            sel.endIndex ? sel.endIndex : 0
        );
    }


    setCursorStyle(selAdj: SelectionAdj, newStyle: CSSObj): void {
        let cursorNd = selAdj.startNode;
        if (cursorNd.textContent != undefined && cursorNd.textContent !== "\u200b") {
            cursorNd = this.insertEmptySpan(selAdj.startNode, selAdj.startOffset);
        }
        const sel = window.getSelection();
        updateNodeStyle(cursorNd, newStyle);

        if (!sel) {return;}
        sel.collapse(cursorNd, 1);
    }


    removeEmptyNodes(restoreSelection?: boolean): void {
        const rootNode = document.getElementById(this.editorDivId) as Node;
        const selAdj = getAdjSelection(false, rootNode);
        for (let i = 0; i < this.emptyNodes.length; i++) {
            const nd = this.emptyNodes[i];
            // Node is not a part of DOM and will be removed during clearing the list.
            if (!nd.parentNode) {continue;}
            if (!nd.textContent || nd.textContent === "\u200b") {
                if (selAdj && restoreSelection && (nd.isSameNode(selAdj?.startNode) || nd.isSameNode(selAdj?.endNode))) {
                    const nodeNew = getPreviousSiblingWithText(nd);
                    if(nodeNew?.textContent) {
                        selAdj.startNode = nodeNew;
                        selAdj.startOffset = nodeNew.textContent.length;
                        selAdj.endNode = nodeNew;
                        selAdj.endOffset = nodeNew.textContent.length;
                    }
                }
                nd.parentNode.removeChild(nd);
            } else if (nd.nodeType === Node.TEXT_NODE){
                nd.textContent = nd.textContent.replace("\u200b", "");
            }
        }
        this.emptyNodes = [];
        if (selAdj && restoreSelection) {
            if (selAdj.endNode.textContent && selAdj.endOffset > selAdj.endNode.textContent?.length) {
                selAdj.endOffset = selAdj.endNode.textContent.length
            }
            setSelection(selAdj.endNode, selAdj.endOffset, selAdj.endNode, selAdj.endOffset);
        }
    }


    // Split node and insert span
    insertEmptySpan(nd: Node, offset: number): Node {
        if (nd.nodeType !== Node.TEXT_NODE) {
            console.error("insertEmptySpan accepts only text nodes, not ", nd.nodeType);
            return nd;
        }
        // if it's already empty node - no need to insert another one.
        if (!nd.textContent && !nd.previousSibling && !nd.nextSibling) {return nd;}
        if (!nd.parentNode) {return nd;}
        const ndInsert = document.createElement("span");
        const ndText = document.createTextNode("\u200b");
        ndInsert.appendChild(ndText);
        this.emptyNodes.push(ndText);
        this.emptyNodes.push(ndInsert);

        if (offset === 0) {
            nd.parentNode.insertBefore(ndInsert, nd);
            return ndText;
        }
        // Append empty node at the end
        insertAfter(nd, ndInsert);
        if (nd.textContent && offset < nd.textContent.length) {
            const textContent = nd.textContent;
            nd.textContent = textContent.substring(0, offset)
            const textEnd = document.createTextNode(textContent.substring(offset));
            
            insertAfter(ndInsert, textEnd);
        }
        return ndText;
    }
}
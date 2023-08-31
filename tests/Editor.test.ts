import { getPreviousSiblingWithText } from "../src/DOMTools";
import { Editor } from "../src/Editor";
import * as selectionAdjModule from "../src/SelectionAdj";
import * as stylingModule from "../src/Styling";
import * as optimiizeDOMModule from '../src/OptimizeDOM';
import * as DOMToolsModule from '../src/DOMTools';
import { SelectionAdj } from "../src/SelectionAdj";
import { CSSObj } from "../src/Styling";

const buildTree = () => {
    /*
             / nd1Span - nd1 
    commonNd - nd2Span - nd2
             \ nd3
    */
    const nd1 = document.createTextNode("test1");
    const nd1Span = document.createElement("SPAN");
    nd1Span.appendChild(nd1);

    const nd2 = document.createTextNode("test2");
    const nd2Span = document.createElement("SPAN");
    nd2Span.appendChild(nd2);

    const nd3 = document.createTextNode("test3");
    const commonNd = document.createElement("SPAN");
    commonNd.appendChild(nd1Span);
    commonNd.appendChild(nd2Span);
    commonNd.appendChild(nd3);

    return {commonNd, nd1Span, nd2Span, nd1, nd2, nd3};
}

const buildEditor = () => {
    const editorContainer = document.createElement("div");
    editorContainer.id = "editor-cont";
    document.body.appendChild(editorContainer);
    const editor = new Editor("editor-cont");
    let editorDiv = document.getElementById(editor.editorDivId);
    editorDiv = editorDiv ? editorDiv : document.createElement("div");
    const editorP = editorDiv.childNodes.length > 0 ? editorDiv.childNodes[0] : document.createElement("p");
    const txtNd = editorP.childNodes.length > 0 ? editorP.childNodes[0] : document.createTextNode("");
    txtNd.textContent = "";

    return {editor, editorDiv, editorP, txtNd};
}

const getAdjSelectionMock = jest.spyOn(selectionAdjModule, 'getAdjSelection' as any)
const restoreSelectionSpy = jest.spyOn(selectionAdjModule, 'restoreSelection' as any);
const getNestedStyleMock = jest.spyOn(stylingModule, 'getNestedStyle' as any);
const setStyleMock = jest.spyOn(stylingModule, 'setStyle' as any);
const optimizeNodeMock = jest.spyOn(optimiizeDOMModule, 'optimizeNode' as any);
const getNodeHierarchyMock = jest.spyOn(DOMToolsModule, 'getNodeHierarchy' as any);

afterEach(() => {
    let sel = document.getSelection();
    sel?.removeAllRanges();
    document.body.innerHTML = "";
    getAdjSelectionMock.mockReset();
    getNestedStyleMock.mockReset();
    restoreSelectionSpy.mockReset();
    setStyleMock.mockReset();
    optimizeNodeMock.mockReset();
    getNodeHierarchyMock.mockReset();
});

describe('Testing constructor', () => {
    test('detached node', () => {
        const editor = new Editor();

        expect(editor.toolsDivId).toBe(editor.containerId + "-tools");
        expect(editor.editorDivId).toBe(editor.containerId + "-editor");
        expect(editor.editorContainer.childNodes.length).toBe(3);

        const defaultStyleNd = editor.editorContainer.childNodes[0];
        const toolsDivId = (editor.editorContainer.childNodes[1] as HTMLElement).id;
        const eventDiv = (editor.editorContainer.childNodes[2] as HTMLElement);
        const editorDivId = (eventDiv.childNodes[0] as HTMLElement).id;
        expect(defaultStyleNd.nodeName).toBe("STYLE");
        expect(toolsDivId).toBe(editor.toolsDivId);
        expect(editorDivId).toBe(editor.editorDivId);
    });
});

describe('Testing getEditorRootNode', () => {
    test('wrong id', () => {
        const nd = Editor.getEditorRootNode("wrong-id");
        // Id "wrong-id" doesn't exist in DOM
        expect(nd.id).toBe("wrong-id");
        expect(nd.innerHTML).toBe("");
        expect(nd.nodeName).toBe("DIV");
    });

    test('no id', () => {
        const nd = Editor.getEditorRootNode();
        expect(nd.id.substring(0, 7)).toBe("editor-");
        expect(nd.innerHTML).toBe("");
        expect(nd.nodeName).toBe("DIV");
    });

    test('id exists in DOM', () => {
        const ndDiv = document.createElement("DIV");
        ndDiv.id = "editor-div-id";
        document.body.appendChild(ndDiv);

        const nd = Editor.getEditorRootNode("editor-div-id");
        expect(nd.parentNode).toEqual(document.body);
        expect(nd.id).toBe("editor-div-id");
        expect(nd.innerHTML).toBe("");
        expect(nd.nodeName).toBe("DIV");
    });
});

describe('Testing createToolboxContainer', () => {
    test('createToolboxContainer', () => {
        const id = "editor-div-id";

        const nd = Editor.createToolboxContainer(id);
        expect(nd.id).toBe(id);
        expect(nd.innerHTML).toBe("");
        expect(nd.nodeName).toBe("DIV");
    });
});

describe('Testing createEventContainer', () => {
    test('createEventContainer', () => {
        const nd = Editor.createEventContainer();
        expect(nd.nodeName).toBe("DIV");
    });
});

describe('Testing createEditorContainer', () => {
    test('createEditorContainer', () => {
        const id = "editor-div-id";

        const nd = Editor.createEditorContainer(id);
        expect(nd.id).toBe(id);
        expect(nd.innerHTML).toBe("");
        expect(nd.nodeName).toBe("DIV");
        expect(nd.contentEditable).toBe("true");
    });
});

describe('Testing insertEmptySpan', () => {
    test('wrond node type without children', () => {
        const nd = document.createElement("DIV");
        const editor = new Editor();

        const res = editor.insertEmptySpan(nd, 0);
        expect(res.childNodes.length).toBe(0);
        expect(nd.childNodes.length).toBe(1);
        expect(nd.textContent).toBe("");
    });

    test('wrond node type, with children', () => {
        const nd = document.createElement("DIV");
        nd.appendChild(document.createElement("BR"));
        const editor = new Editor();

        const res = editor.insertEmptySpan(nd, 0);
        expect(res).toEqual(nd);
    });

    test('empty node', () => {
        const nd = document.createTextNode("");
        const editor = new Editor();

        const res = editor.insertEmptySpan(nd, 0);
        expect(res).toEqual(nd);
    });

    test('no parent node', () => {
        const nd = document.createTextNode("test");
        const editor = new Editor();

        const res = editor.insertEmptySpan(nd, 1);
        expect(res).toEqual(nd);
    });

    test('offset is not 0', () => {
        const ndSpan = document.createElement("DIV");
        const nd = document.createTextNode("test");
        ndSpan.appendChild(nd);
        const editor = new Editor();

        const res = editor.insertEmptySpan(nd, 1);
        expect(res.nodeType).toBe(Node.TEXT_NODE);
        expect(res.textContent).toBe("\u200b");
        const resSpan = res.parentNode;
        expect(editor.emptyNodes.includes(res)).toBeTruthy();
        expect(ndSpan.childNodes.length).toBe(3);
        expect(ndSpan.childNodes[0].textContent).toBe("t");
        expect(ndSpan.childNodes[1]).toEqual(resSpan);
        expect(ndSpan.childNodes[2].textContent).toBe("est");
    });

    test('offset is not 0', () => {
        const ndSpan = document.createElement("DIV");
        const nd = document.createTextNode("test");
        ndSpan.appendChild(nd);
        const editor = new Editor();

        const res = editor.insertEmptySpan(nd, 0);
        expect(res.nodeType).toBe(Node.TEXT_NODE);
        expect(res.textContent).toBe("\u200b");
        const resSpan = res.parentNode;
        expect(editor.emptyNodes.includes(res)).toBeTruthy();
        expect(ndSpan.childNodes.length).toBe(2);
        expect(ndSpan.childNodes[0]).toEqual(resSpan);
        expect(ndSpan.childNodes[1].textContent).toBe("test");
    });
});

describe('Testing editor fixture', () => {
    test('editor builder test.', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();

        expect(txtNd.nodeType).toBe(Node.TEXT_NODE);
        expect(editorP.nodeName).toBe("P");
        expect(editorDiv.nodeName).toBe("DIV");
        expect(txtNd.parentNode).toEqual(editorP);
        expect(editorP.parentNode).toEqual(editorDiv);
    });
});

describe('Testing setCursorStyle', () => {
    test('createEditorContainer', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        txtNd.textContent = "Hello World!";
        editorP.appendChild(txtNd);

        let selAdj: SelectionAdj = {
            startNode: txtNd,
            startOffset: 5,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: true
        };

        const style: CSSObj = {
            "font-weight": "bold",
            "font-size": "9pt",
        };

        editor.setCursorStyle(selAdj, style);

        expect(editorP.childNodes.length).toBe(3);
        expect(editorP.childNodes[1].nodeName).toBe("SPAN");
        expect(editorP.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(editorP.childNodes[2].nodeType).toBe(Node.TEXT_NODE);
        expect(editorP.childNodes[0].textContent).toBe("Hello");
        expect(editorP.childNodes[1].textContent).toBe("\u200b");
        expect((editorP.childNodes[1] as HTMLElement).style.fontWeight).toBe("bold");
        expect((editorP.childNodes[1] as HTMLElement).style.fontSize).toBe("9pt");
    });
});

describe('Testing removeEmptyNodes', () => {
    test('changes applied to node with enmpty space.', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        txtNd.textContent = "Hello ";
        const ndSpan = document.createElement("SPAN");
        const nd = document.createTextNode("\u200bWorld!");
        ndSpan.appendChild(nd);
        editorP.appendChild(txtNd);
        editorP.appendChild(ndSpan);

        let sel = window.getSelection();
        const selRange = document.createRange();
        selRange.setStart(nd, 0);
        selRange.setEnd(nd, 4);
        sel?.removeAllRanges();
        sel?.addRange(selRange);

        expect(editorP.textContent).toBe("Hello \u200bWorld!");

        editor.emptyNodes = [nd];
        editor.removeEmptyNodes(true);

        expect(editor.emptyNodes.length).toBe(0);
        expect(editorP.textContent).toBe("Hello World!");
    });

    test('changes not applied to node with enmpty space 1.', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        txtNd.textContent = "Hello ";
        const ndSpan = document.createElement("SPAN");
        const nd1 = document.createTextNode("\u200b");
        const nd2 = document.createTextNode("World!");
        ndSpan.appendChild(nd1);
        editorP.appendChild(txtNd);
        editorP.appendChild(ndSpan);
        editorP.appendChild(nd2);

        let sel = window.getSelection();
        const selRange = document.createRange();
        selRange.setStart(nd1, 1);
        selRange.setEnd(nd1, 1);
        sel?.removeAllRanges();
        sel?.addRange(selRange);

        expect(editorP.textContent).toBe("Hello \u200bWorld!");
        editor.emptyNodes = [nd1];
        editor.removeEmptyNodes(true);

        expect(editor.emptyNodes.length).toBe(0);
        expect(editorP.textContent).toBe("Hello World!");
    });

    test('changes not applied to node with enmpty space 2.', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const ndSpan = document.createElement("SPAN");
        const nd1 = document.createTextNode("\u200b");
        const nd2 = document.createTextNode("World!");
        ndSpan.appendChild(nd1);
        editorP.replaceChild(ndSpan, txtNd) //appendChild(ndSpan);
        editorP.appendChild(nd2);

        let sel = window.getSelection();
        const selRange = document.createRange();
        selRange.setStart(nd1, 1);
        selRange.setEnd(nd1, 1);
        sel?.removeAllRanges();
        sel?.addRange(selRange);

        expect(editorP.textContent).toBe("\u200bWorld!");

        editor.emptyNodes = [ndSpan, nd1];
        editor.removeEmptyNodes(true);

        expect(editor.emptyNodes.length).toBe(0);
        expect(editorP.textContent).toBe("World!");
    });
});

describe('Testing selectionChanged', () => {
    test('toolbox update', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const mk = jest.fn();
        editor.updateToolboxStyleFromSelection = mk;

        editor.selectionChanged();

        expect(mk.mock.calls).toHaveLength(1);
    });
});

describe('Testing keyUpHandler', () => {
    test('valid key', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const removeEmptyNodesMock = jest.fn();
        const updateToolboxStyleFromSelectionMock = jest.fn();

        editor.removeEmptyNodes = removeEmptyNodesMock;
        editor.updateToolboxStyleFromSelection = updateToolboxStyleFromSelectionMock;

        editor.keyUpHandler({key: "Backspace"} as KeyboardEvent);

        expect(removeEmptyNodesMock.mock.calls).toHaveLength(1);
        expect(updateToolboxStyleFromSelectionMock.mock.calls).toHaveLength(1);
    });

    test('not valid key', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const removeEmptyNodesMock = jest.fn();
        const updateToolboxStyleFromSelectionMock = jest.fn();

        editor.removeEmptyNodes = removeEmptyNodesMock;
        editor.updateToolboxStyleFromSelection = updateToolboxStyleFromSelectionMock;

        editor.keyUpHandler({key: "KeyA"} as KeyboardEvent);

        expect(removeEmptyNodesMock.mock.calls).toHaveLength(0);
        expect(updateToolboxStyleFromSelectionMock.mock.calls).toHaveLength(0);
    });
});

describe('Testing updateToolboxStyleFromSelection', () => {

    test('selection is null', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        
        getNestedStyleMock.mockImplementation(() => {});
        getAdjSelectionMock.mockImplementation(() => {});
        const style: CSSObj = {
            "font-size": "13pt",
            "font-weight": "bold"
        };
        const silentUpdateMock = jest.fn();

        editor.tools.silentUpdate = silentUpdateMock;
        getNestedStyleMock.mockReturnValue(style);
        getAdjSelectionMock.mockReturnValue(undefined);

        editor.updateToolboxStyleFromSelection();

        expect(getAdjSelectionMock.mock.calls).toHaveLength(1);
        expect(getAdjSelectionMock.mock.calls[0][0]).toEqual(false);
        expect(getAdjSelectionMock.mock.calls[0][1]).toEqual(editorDiv);
        expect(getNestedStyleMock.mock.calls).toHaveLength(0);
        expect(silentUpdateMock.mock.calls).toHaveLength(0);
    });

    test('selection not null', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        getNestedStyleMock.mockImplementation(() => {});
        getAdjSelectionMock.mockImplementation(() => {});

        const style: CSSObj = {
            "font-size": "13pt",
            "font-weight": "bold"
        };
        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 5,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: true
        };
        const silentUpdateMock = jest.fn();

        editor.tools.silentUpdate = silentUpdateMock;
        getNestedStyleMock.mockReturnValue(style);
        getAdjSelectionMock.mockReturnValue(sel);

        editor.updateToolboxStyleFromSelection();

        expect(getAdjSelectionMock.mock.calls).toHaveLength(1);
        expect(getAdjSelectionMock.mock.calls[0][0]).toEqual(false);
        expect(getAdjSelectionMock.mock.calls[0][1]).toEqual(editorDiv);
        expect(getNestedStyleMock.mock.calls).toHaveLength(1);
        expect(getNestedStyleMock.mock.calls[0][0]).toEqual(sel);
        expect(silentUpdateMock.mock.calls).toHaveLength(1);
        expect(silentUpdateMock.mock.calls[0][0]).toEqual(style);
    });
});

describe('Testing setStyleFromObj', () => {
    test('no selection', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const updateStyleAndOptimizeMock = jest.fn();
        const setCursorStyleMock = jest.fn();

        getAdjSelectionMock.mockReturnValue(undefined);

        editor.updateStyleAndOptimize = updateStyleAndOptimizeMock;
        editor.setCursorStyle = setCursorStyleMock;

        const style = {"font-size": "13pt"} as CSSObj;
        editor.setStyleFromObj(style);

        expect(updateStyleAndOptimizeMock.mock.calls).toHaveLength(0);
        expect(setCursorStyleMock.mock.calls).toHaveLength(0);
    });

    test('selection empty', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const updateStyleAndOptimizeMock = jest.fn();
        const setCursorStyleMock = jest.fn();

        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 5,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: true
        };
        getAdjSelectionMock.mockReturnValue(sel);

        editor.updateStyleAndOptimize = updateStyleAndOptimizeMock;
        editor.setCursorStyle = setCursorStyleMock;

        const style = {"font-size": "13pt"} as CSSObj;
        editor.setStyleFromObj(style);

        expect(updateStyleAndOptimizeMock.mock.calls).toHaveLength(0);
        expect(setCursorStyleMock.mock.calls).toHaveLength(1);
        expect(setCursorStyleMock.mock.calls[0][0]).toEqual(sel);
        expect(setCursorStyleMock.mock.calls[0][1]).toEqual(style);
    });

    test('selection not empty', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const updateStyleAndOptimizeMock = jest.fn();
        const setCursorStyleMock = jest.fn();

        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 1,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: false
        };
        getAdjSelectionMock.mockReturnValue(sel);

        editor.updateStyleAndOptimize = updateStyleAndOptimizeMock;
        editor.setCursorStyle = setCursorStyleMock;

        const style = {"font-size": "13pt"} as CSSObj;
        editor.setStyleFromObj(style);

        expect(setCursorStyleMock.mock.calls).toHaveLength(0);
        expect(updateStyleAndOptimizeMock.mock.calls).toHaveLength(1);
        expect(updateStyleAndOptimizeMock.mock.calls[0][0]).toEqual(editorDiv);
        expect(updateStyleAndOptimizeMock.mock.calls[0][1]).toEqual(sel);
        expect(updateStyleAndOptimizeMock.mock.calls[0][2]).toEqual(style);
    });

    test('only set alignment', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const updateStyleAndOptimizeMock = jest.fn();
        const setCursorStyleMock = jest.fn();
        const setAlignmentMock = jest.fn();

        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 1,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: false
        };
        getAdjSelectionMock.mockReturnValue(sel);
        setAlignmentMock.mockReturnValue({});

        editor.updateStyleAndOptimize = updateStyleAndOptimizeMock;
        editor.setCursorStyle = setCursorStyleMock;

        const style = {"text-align": "left"} as CSSObj;
        editor.setStyleFromObj(style);

        expect(setCursorStyleMock.mock.calls).toHaveLength(0);
        expect(updateStyleAndOptimizeMock.mock.calls).toHaveLength(0);
    });
});

describe('Testing setAlignment', () => {
    test('Text node selected', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const style = {
            "font-size": "13pt",
            "text-align": "right"
        } as CSSObj;
        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 1,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: false
        };

        expect((editorP as HTMLElement).style?.textAlign).toBe("");

        const newStyle = editor.setAlignment(sel, style);

        expect((editorP as HTMLElement).style?.textAlign).toBe("right");
        expect(newStyle).toEqual({"font-size": "13pt"});
    });

    test('Wrong hierarchy', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const style = {
            "font-size": "13pt",
            "text-align": "right"
        } as CSSObj;
        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 1,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: false
        };
        const nd = document.createTextNode("txt");
        getNodeHierarchyMock.mockReturnValue([nd]);

        expect((editorP as HTMLElement).style?.textAlign).toBe("");

        const newStyle = editor.setAlignment(sel, style);

        expect((editorP as HTMLElement).style?.textAlign).toBe("");
        expect(newStyle).toEqual({"font-size": "13pt"});
    });

    test('No alignment property in style.', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const style = {
            "font-size": "13pt"
        } as CSSObj;
        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 1,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: false
        };

        expect((editorP as HTMLElement).style?.textAlign).toBe("");

        const newStyle = editor.setAlignment(sel, style);

        expect((editorP as HTMLElement).style?.textAlign).toBe("");
        expect(newStyle).toEqual({"font-size": "13pt"});
    });

    test('Nested node selected', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        editorP.appendChild(commonNd);

        const style = {
            "font-size": "13pt",
            "text-align": "right"
        } as CSSObj;
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd1,
            endOffset: 5,
            commonNode: nd1Span,
            isEmpty: false
        };

        expect((editorP as HTMLElement).style?.textAlign).toBe("");

        const newStyle = editor.setAlignment(sel, style);

        expect((editorP as HTMLElement).style?.textAlign).toBe("right");
        expect(newStyle).toEqual({"font-size": "13pt"});
    });

    test('Nested node selected, empty selection', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        editorP.appendChild(commonNd);

        const style = {
            "font-size": "13pt",
            "text-align": "right"
        } as CSSObj;
        const sel: SelectionAdj = {
            startNode: nd2,
            startOffset: 1,
            endNode: nd2,
            endOffset: 1,
            commonNode: nd2Span,
            isEmpty: true
        };

        expect((editorP as HTMLElement).style?.textAlign).toBe("");

        const newStyle = editor.setAlignment(sel, style);

        expect((editorP as HTMLElement).style?.textAlign).toBe("right");
        expect(newStyle).toEqual({"font-size": "13pt"});
    });
});

describe('Testing updateStyleAndOptimize', () => {
    test('optimization failed', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        getAdjSelectionMock.mockImplementation(() => {});
        setStyleMock.mockImplementation(() => {});
        optimizeNodeMock.mockImplementation(() => {});
        restoreSelectionSpy.mockImplementation(() => {});

        const style = {"font-size": "13pt"} as CSSObj;
        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 1,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: false
        };

        const editorDivParent = editorDiv.parentNode;
        optimizeNodeMock.mockReturnValue(undefined);

        editor.updateStyleAndOptimize(editorDiv, sel, style);

        expect(setStyleMock.mock.calls).toHaveLength(1);
        expect(optimizeNodeMock.mock.calls).toHaveLength(1);
        expect(restoreSelectionSpy.mock.calls).toHaveLength(1);
        // editor div has not been replace because optimization has failed
        expect(editorDivParent?.childNodes[0]).toEqual(editorDiv);
    });

    test('optimization success', () => {
        const {editor, editorDiv, editorP, txtNd} = buildEditor();
        getAdjSelectionMock.mockImplementation(() => {});
        setStyleMock.mockImplementation(() => {});
        optimizeNodeMock.mockImplementation(() => {});
        restoreSelectionSpy.mockImplementation(() => {});

        const style = {"font-size": "13pt"} as CSSObj;
        const sel: SelectionAdj = {
            startNode: txtNd,
            startOffset: 1,
            endNode: txtNd,
            endOffset: 5,
            commonNode: editorP,
            isEmpty: false
        };

        const editorDivParent = editorDiv.parentNode;
        const optimizationRes = document.createElement("div");
        optimizeNodeMock.mockReturnValue(optimizationRes);

        editor.updateStyleAndOptimize(editorDiv, sel, style);

        expect(setStyleMock.mock.calls).toHaveLength(1);
        expect(optimizeNodeMock.mock.calls).toHaveLength(1);
        expect(optimizeNodeMock.mock.calls[0][0]).toEqual(editorDiv);
        expect(restoreSelectionSpy.mock.calls).toHaveLength(1);
        // editor div has been replacd with optimized node
        expect(editorDivParent?.childNodes[0]).toEqual(optimizationRes);
    });
});

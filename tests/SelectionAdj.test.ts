import { SelectionAdj ,onlyForTesting, getAdjSelection, restoreSelection } from "../src/SelectionAdj";

const {
    fixSelectionEnd,
    getIndex,
    isReverseSelection,
    limitSelectionToNode,
    splitSelectionNodes,
    splitStart,
    splitEnd
} = onlyForTesting;

// Build virtual tree and connect root to body
const buildTree = () => {
    /*
    document - body - commonNd - nd1Span - nd1 
                               \ nd2
    */
    const nd1 = document.createTextNode("test1");
    const nd1Span = document.createElement("SPAN");
    nd1Span.appendChild(nd1);

    const nd2 = document.createTextNode("test2");
    const commonNd = document.createElement("SPAN");
    commonNd.appendChild(nd1Span);
    commonNd.appendChild(nd2);
    document.body.appendChild(commonNd);
    return {commonNd, nd1Span, nd1, nd2}
}

// Set selection in Jest DOM
const mockSelection = (
    startNode: Node, 
    startOffset: number, 
    endNode: Node, 
    endOffset: number, 
    isCollapset?: boolean): void  => {
        
        let sel = document.getSelection();
        let selRange = new Range();
        selRange.setStart(startNode, startOffset);
        selRange.setEnd(endNode, endOffset);
        sel?.removeAllRanges();
        sel?.addRange(selRange);
        if (isCollapset) {sel?.collapseToStart()};
    }

// After each test -> clear document, remove selection
afterEach(() => {
    document.body.innerHTML = "";
    let sel = document.getSelection();
    sel?.removeAllRanges();
});


describe('Testing restoreSelection', () => {
    test('text node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        restoreSelection(commonNd, 1, 5);

        const sel = document.getSelection();
        expect(sel?.anchorNode).toEqual(nd1);
        expect(sel?.focusNode).toEqual(nd1);
        expect(sel?.focusOffset).toEqual(nd1.textContent?.length);
    });
});


describe('Testing fixSelectionEnd', () => {
    test('correct end offset', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        let selAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd1,
            endOffset: 5,
            commonNode: nd1Span,
            isEmpty: false
        } as SelectionAdj

        expect(selAdj).toEqual(fixSelectionEnd(selAdj));
    });

    test('end offset is 0', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        let selAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd2,
            endOffset: 0,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj

        const res = fixSelectionEnd(selAdj);
        expect(res.endNode).toEqual(nd1);
        expect(res.endOffset).toEqual(nd1.length);
    });
});


describe('Testing getIndex', () => {
    test('test1', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        expect(getIndex(nd2, 3, commonNd)).toBe(8);
        expect(getIndex(nd1, 3, nd1Span)).toBe(3);
    });
});


describe('Testing isReverseSelection', () => {
    test('text node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        expect(isReverseSelection([commonNd, nd2], [commonNd, nd1Span, nd1], commonNd)).toBe(true);
        expect(isReverseSelection([commonNd, nd1Span, nd1], [commonNd, nd2], commonNd)).toBe(false);
    });

    test('wrong pasrameters/hierarchy', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        expect(isReverseSelection([nd1], [commonNd, nd2], nd1Span)).toBe(false);
    });
});


describe('Testing limitSelectionToNode', () => {
    test('limit end', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        let selAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd2,
            endOffset: 3,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj

        const res = limitSelectionToNode(selAdj, nd1Span);
        expect(res.startNode).toEqual(nd1);
        expect(res.startOffset).toEqual(1);
        expect(res.endNode).toEqual(nd1);
        expect(res.endOffset).toEqual(5);
        expect(res.commonNode).toEqual(nd1Span);
    });

    test('limit start', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd3Span = document.createElement("SPAN");
        const nd3 = document.createTextNode("text3");
        nd3Span.appendChild(nd3);
        commonNd.appendChild(nd3Span);

        let selAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd3,
            endOffset: 3,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj

        const res = limitSelectionToNode(selAdj, nd3Span);
        expect(res.startNode).toEqual(nd3);
        expect(res.startOffset).toEqual(0);
        expect(res.endNode).toEqual(nd3);
        expect(res.endOffset).toEqual(3);
        expect(res.commonNode).toEqual(nd3Span);
    });

    test('no changes', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        let selAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd2,
            endOffset: 3,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj

        const res = limitSelectionToNode(selAdj, commonNd);
        expect(res.startNode).toEqual(nd1);
        expect(res.startOffset).toEqual(1);
        expect(res.endNode).toEqual(nd2);
        expect(res.endOffset).toEqual(3);
        expect(res.commonNode).toEqual(commonNd);
    });

    test('result is not same node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd3 = document.createTextNode("text3");
        nd1Span.appendChild(nd3);

        let selAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd2,
            endOffset: 3,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj

        const res = limitSelectionToNode(selAdj, nd1Span);
        expect(res.startNode).toEqual(nd1);
        expect(res.startOffset).toEqual(1);
        expect(res.endNode).toEqual(nd3);
        expect(res.endOffset).toEqual(5);
        expect(res.commonNode).toEqual(nd1Span);
    });
});


describe('Testing splitStart', () => {
    test('no split, return same node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        expect(splitStart(nd1, 0)).toEqual(nd1);
    });

    test('wrong node type', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(splitStart(nd1Span, 0)).toEqual(nd1Span);
        expect(logSpy).toHaveBeenCalled();
    });

    test('print message in console', () => {
        const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});;

        splitStart(document.createTextNode("test"), 2);
        expect(logSpy).toHaveBeenCalled();
    });

    test('split node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        const res = splitStart(nd1, 2);
        expect(nd1Span.childNodes.length).toBe(2);
        expect(nd1Span.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(nd1Span.childNodes[1].nodeName).toBe("SPAN");
        expect(nd1Span.childNodes[1].childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(nd1Span.childNodes[0].textContent).toBe("te");
        expect(nd1Span.childNodes[1].textContent).toBe("st1");
        expect(nd1Span.childNodes[1].childNodes[0]).toEqual(res);
    });

    test('split node, sibling available', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd3 = document.createTextNode("test3");
        nd1Span.appendChild(nd3);

        const res = splitStart(nd1, 2);
        expect(nd1Span.childNodes.length).toBe(3);
        expect(nd1Span.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(nd1Span.childNodes[1].nodeName).toBe("SPAN");
        expect(nd1Span.childNodes[1].childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(nd1Span.childNodes[0].textContent).toBe("te");
        expect(nd1Span.childNodes[1].textContent).toBe("st1");
        expect(nd1Span.childNodes[1].childNodes[0]).toEqual(res);
    });
});


describe('Testing splitEnd', () => {
    test('no split, return same node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        expect(splitEnd(nd1, 5)).toEqual(nd1);
    });

    test('wrong node type', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(splitEnd(nd1Span, 0)).toEqual(nd1Span);
        expect(logSpy).toHaveBeenCalled();
    });

    test('print message in console', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});;

        splitEnd(document.createTextNode("test"), 2);
        expect(logSpy).toHaveBeenCalledWith("wrong end element");
    });

    test('split node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        const res = splitEnd(nd1, 2);
        expect(nd1Span.childNodes.length).toBe(2);
        expect(nd1Span.childNodes[1].nodeType).toBe(Node.TEXT_NODE);
        expect(nd1Span.childNodes[0].nodeName).toBe("SPAN");
        expect(nd1Span.childNodes[0].childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(nd1Span.childNodes[1].textContent).toBe("st1");
        expect(nd1Span.childNodes[0].textContent).toBe("te");
        expect(nd1Span.childNodes[0].childNodes[0]).toEqual(res);
    });

    test('split node, sibling available', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd3 = document.createTextNode("test3");
        nd1Span.appendChild(nd3);

        const res = splitEnd(nd3, 2);
        expect(nd1Span.childNodes.length).toBe(3);
        expect(nd1Span.childNodes[2].nodeType).toBe(Node.TEXT_NODE);
        expect(nd1Span.childNodes[1].nodeName).toBe("SPAN");
        expect(nd1Span.childNodes[1].childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(nd1Span.childNodes[1].textContent).toBe("te");
        expect(nd1Span.childNodes[2].textContent).toBe("st3");
        expect(nd1Span.childNodes[1].childNodes[0]).toEqual(res);
    });
});


describe('Testing splitSelectionNodes', () => {
    test('no split, return same selection', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        let selAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd2,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj

        const res = splitSelectionNodes(selAdj);

        expect(res).toEqual({
            startNode: nd1,
            startOffset: 0,
            endNode: nd2,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj);
    });

    test('split start and end, same node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        let selAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd1,
            endOffset: 4,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj

        const res = splitSelectionNodes(selAdj);

        expect(res.startOffset).toBe(0);
        expect(res.endOffset).toBe(3);
        expect(res.startNode.textContent).toBe(res.endNode.textContent);
        expect(res.startNode.textContent).toBe("est");
    });

    test('split start and end, different nodes', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        let selAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd2,
            endOffset: 4,
            commonNode: commonNd,
            isEmpty: false
        } as SelectionAdj

        const res = splitSelectionNodes(selAdj);

        expect(res.startOffset).toBe(0);
        expect(res.endOffset).toBe(4);
        expect(res.endNode.textContent).toBe("test");
        expect(res.startNode.textContent).toBe("est1");
    });
});


describe('Testing getAdjSelection', () => {
    test('no slection', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        expect(getAdjSelection(false, commonNd)).toBe(undefined);
    });

    test('same text node, split-false', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        mockSelection(nd1, 1, nd1, 1);

        const res = getAdjSelection(false, commonNd);

        expect(res?.startNode).toEqual(nd1);
        expect(res?.endNode).toEqual(nd1);
        expect(res?.startOffset).toBe(1);
        expect(res?.endOffset).toBe(1);
        expect(res?.isEmpty).toBe(true);
        expect(res?.commonNode).toBe(nd1Span);
    });

    test('same text node, split-false', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        mockSelection(nd1, 1, nd1, 3);

        const res = getAdjSelection(false, commonNd);
        const sel = document.getSelection();

        expect(res?.startNode).toEqual(nd1);
        expect(res?.endNode).toEqual(nd1);
        expect(res?.startOffset).toBe(1);
        expect(res?.endOffset).toBe(3);
        expect(res?.startIndex).toBe(1);
        expect(res?.endIndex).toBe(3);
        expect(res?.isEmpty).toBe(false);
        expect(res?.commonNode).toBe(nd1Span);
    });

    test('same text node, split-true', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        mockSelection(nd1, 1, nd1, 3);

        const res = getAdjSelection(true, commonNd);
        const sel = document.getSelection();

        expect(res?.startNode.textContent).toBe("es");
        expect(res?.endNode.textContent).toBe("es");
        expect(res?.endNode).toBe(res?.startNode);
        expect(res?.startOffset).toBe(0);
        expect(res?.endOffset).toBe(2);
        expect(res?.startIndex).toBe(1);
        expect(res?.endIndex).toBe(3);
        expect(res?.isEmpty).toBe(false);
        expect(res?.commonNode).toBe(nd1Span);
    });
    
    test('split-false', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        mockSelection(nd1, 2, nd2, 3);

        const res = getAdjSelection(false, commonNd);

        expect(res?.startNode.isSameNode(nd1)).toBe(true);
        expect(res?.endNode.isSameNode(nd2)).toBe(true);
        expect(res?.startOffset).toBe(2);
        expect(res?.endOffset).toBe(3);
        expect(res?.startIndex).toBe(2);
        expect(res?.endIndex).toBe(8);
        expect(res?.isEmpty).toBe(false);
        expect(res?.commonNode).toBe(commonNd);
    });


    test('split-true', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        mockSelection(nd1, 2, nd2, 3);

        const res = getAdjSelection(true, commonNd);
        const sel = document.getSelection();
        const selStart = sel?.anchorNode;
        const selEnd = sel?.focusNode;

        expect(res?.startNode).toEqual(nd1Span.childNodes[1].childNodes[0]);
        expect(res?.endNode).toEqual(commonNd.childNodes[1].childNodes[0]);
        expect(res?.startNode.textContent).toBe("st1");
        expect(res?.endNode.textContent).toBe("tes");
        expect(res?.startOffset).toBe(0);
        expect(res?.endOffset).toBe(res?.endNode.textContent?.length);
        expect(res?.startIndex).toBe(2);
        expect(res?.endIndex).toBe(8);
        expect(res?.isEmpty).toBe(false);
        expect(res?.commonNode).toBe(commonNd);
    });
});

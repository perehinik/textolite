import {
    getChildNodeByIndex,
    getNodeHierarchy,
    getCommonNode,
    isChildOrGrandChild,
    getPreviousSiblingWithText,
    getRightMostTextNode,
    getLeftMostTextNode,
    insertAfter
} from "../src/DOMTools";


const buildTree = () => {
    /*
    commonNd - nd1Span - nd1 
             \ nd2
    */
    const nd1 = document.createTextNode("test1");
    const nd1Span = document.createElement("SPAN");
    nd1Span.appendChild(nd1);

    const nd2 = document.createTextNode("test2");
    const commonNd = document.createElement("SPAN");
    commonNd.appendChild(nd1Span);
    commonNd.appendChild(nd2);
    return {commonNd, nd1Span, nd1, nd2}
}

describe('Testing getChildNodeByIndex', () => {
    test('without span', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getChildNodeByIndex(nd1, 1);

        expect(res.node.isSameNode(nd1)).toBeTruthy();
        expect(res.offset).toBe(1);
    });

    test('with span 1', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getChildNodeByIndex(commonNd, 1);

        expect(res.node.isSameNode(nd1)).toBeTruthy();
        expect(res.offset).toBe(1);
    });

    test('with span 2', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getChildNodeByIndex(commonNd, 7);

        expect(res.node.isSameNode(nd2)).toBeTruthy();
        expect(res.offset).toBe(2);
    });

    test('with span 3', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getChildNodeByIndex(commonNd, 5);

        expect(res.node.isSameNode(nd2)).toBeTruthy();
        expect(res.offset).toBe(0);
    });

    test('last character', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getChildNodeByIndex(commonNd, 11);

        expect(res.node).toEqual(nd2);
        expect(res.offset).toBe(5);
    });

    test('with empty span', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const emptyNd = document.createElement("SPAN");
        commonNd.insertBefore(emptyNd, nd2);

        const res = getChildNodeByIndex(commonNd, 8);

        expect(res.node.isSameNode(nd2)).toBeTruthy();
        expect(res.offset).toBe(3);
    });
});

describe('Testing getNodeHierarchy', () => {
    test('long branch', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getNodeHierarchy(nd1, commonNd);

        expect(res.length).toBe(3);
        expect(res[0].isSameNode(commonNd)).toBe(true);
        expect(res[1].isSameNode(nd1Span)).toBe(true);
        expect(res[2].isSameNode(nd1)).toBe(true);
    });

    test('short branch', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getNodeHierarchy(nd2, commonNd);

        expect(res.length).toBe(2);
        expect(res[0].isSameNode(commonNd)).toBe(true);
        expect(res[1].isSameNode(nd2)).toBe(true);
    });

    test('only common node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const res = getNodeHierarchy(commonNd, commonNd);

        expect(res.length).toBe(1);
        expect(res[0].isSameNode(commonNd)).toBe(true);
    });
});

describe('Testing getCommonNode', () => {
    test('tree 1', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd12 = document.createTextNode("text12");
        nd1Span.appendChild(nd12);
        
        const res = getCommonNode([commonNd, nd1Span, nd1], [commonNd, nd1Span, nd12]);

        expect(res.nodeName).toBe("SPAN");
        expect(res.isSameNode(nd1Span)).toBe(true);
    });

    test('tree 2', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getCommonNode([commonNd, nd1Span, nd1], [commonNd, nd2]);

        expect(res.nodeName).toBe("SPAN");
        expect(res.isSameNode(commonNd)).toBe(true);
    });

    test('single span', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getCommonNode([nd1Span], [nd1Span]);

        expect(res.nodeName).toBe("SPAN");
        expect(res.isSameNode(nd1Span)).toBe(true);
    });

    test('text node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getCommonNode([nd1], [nd1]);

        expect(res.nodeType).toBe(Node.TEXT_NODE);
        expect(res.isSameNode(nd1)).toBe(true);
    });
});


describe('Testing isChildOrGrandChild', () => {
    test('positive tests', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd12 = document.createTextNode("text12");
        nd1Span.appendChild(nd12);
        
        const res = getCommonNode([commonNd, nd1Span, nd1], [commonNd, nd1Span, nd12]);

        expect(isChildOrGrandChild(nd1, commonNd)).toBe(true);
        expect(isChildOrGrandChild(nd2, commonNd)).toBe(true);
        expect(isChildOrGrandChild(nd1, nd1Span)).toBe(true);
    });

    test('negative tests', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd12 = document.createTextNode("text12");
        nd1Span.appendChild(nd12);
        
        const res = getCommonNode([commonNd, nd1Span, nd1], [commonNd, nd1Span, nd12]);

        expect(isChildOrGrandChild(commonNd, nd1)).toBe(false);
        expect(isChildOrGrandChild(commonNd, nd2)).toBe(false);
        expect(isChildOrGrandChild(nd2, nd1Span)).toBe(false);
        expect(isChildOrGrandChild(commonNd, commonNd)).toBe(false);
    });
});


describe('Testing getPreviousSiblingWithText', () => {
    test('sibling in same node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd0 = document.createTextNode("text0");
        nd1Span.insertBefore(nd0, nd1);
        
        const res = getPreviousSiblingWithText(nd1);

        expect(res?.isSameNode(nd0)).toBe(true);
    });

    test('sibling in parent node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd0 = document.createTextNode("text0");
        commonNd.insertBefore(nd0, nd1Span);
        
        const res = getPreviousSiblingWithText(nd1);

        expect(res?.isSameNode(nd0)).toBe(true);
    });

    test('no sibling node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        
        const res = getPreviousSiblingWithText(nd1);

        expect(res).toBe(undefined);
    });
});


describe('Testing getRightMostTextNode', () => {
    test('same node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const res = getRightMostTextNode(nd1);
        expect(res?.isSameNode(nd1)).toBe(true);
    });

    test('span with parent', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const res = getRightMostTextNode(nd1Span);
        expect(res?.isSameNode(nd1)).toBe(true);
    });

    test('span without parent', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const res = getRightMostTextNode(commonNd);
        expect(res?.isSameNode(nd2)).toBe(true);
    });
});


describe('Testing getLeftMostTextNode', () => {
    test('same node', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const res = getLeftMostTextNode(nd2);
        expect(res?.isSameNode(nd2)).toBe(true);
    });

    test('span with parent', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const res = getLeftMostTextNode(nd1Span);
        expect(res?.isSameNode(nd1)).toBe(true);
    });

    test('span without parent', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const res = getLeftMostTextNode(commonNd);
        expect(res?.isSameNode(nd1)).toBe(true);
    });
});

describe('Testing insertAfter', () => {
    test('no parent', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();

        const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        insertAfter(commonNd, nd1)
        expect(logSpy).toHaveBeenCalled();
    });

    test('next sibling exists', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd11 = document.createTextNode("text11");

        insertAfter(nd1Span, nd11);
        expect(commonNd.childNodes[1]).toBe(nd11);
    });

    test('next sibling does not exists', () => {
        const {commonNd, nd1Span, nd1, nd2} = buildTree();
        const nd11 = document.createTextNode("text11");

        insertAfter(nd2, nd11);
        expect(commonNd.childNodes[2]).toBe(nd11);
    });
});
import { SelectionAdj } from "../src/SelectionAdj";
import {
    CSSObj,
    undefinedStyle,
    getStyle,
    getStyleFromRoot,
    applyOverlappingStyle,
    getNestedStyle,
    onlyForTesting,
    setStyle,
    updateNodeStyle,
    compareChildStyle,
    compareNodeStyles
} from "../src/Styling";

const {
    combineNestedStyles,
    getNodeNestedStyle,
    resetChildrenStyle,
    setStyleFromStart,
    setStyleFromEnd
} = onlyForTesting;


const buildTree = () => {
    /*
             / nd1Span - nd1 
             / br1
    commonNd - nd2Span - nd2
             \ br2
             \ nd3
    */
    const nd1 = document.createTextNode("test1");
    const br1 = document.createElement("BR");
    const nd1Span = document.createElement("SPAN");
    nd1Span.appendChild(nd1);

    const nd2 = document.createTextNode("test2");
    const br2 = document.createElement("BR");
    const nd2Span = document.createElement("SPAN");
    nd2Span.appendChild(nd2);

    const nd3 = document.createTextNode("test3");
    const commonNd = document.createElement("SPAN");
    commonNd.appendChild(nd1Span);
    commonNd.appendChild(br1);
    commonNd.appendChild(nd2Span);
    commonNd.appendChild(br2);
    commonNd.appendChild(nd3);

    return {commonNd, nd1Span, nd2Span, nd1, nd2, nd3, br1, br2};
}


describe('Testing undefinedStyle', () => {
    test('simple test', () => {
        expect(undefinedStyle).toBe("*x*");
    });
});


describe('Testing getStyle', () => {
    test('basic tests', () => {
        const nd = document.createElement("SPAN");
        nd.style.fontStyle = "bold";
    
        expect(getStyle(nd)["font-style"]).toBe("bold");
        expect(Object.keys(getStyle()).length).toBe(0);
    });
});

describe('Testing applyOverlappingStyle', () => {
    test('different styles', () => {
        const parent_style: CSSObj = {
            "font-weight": "bold",
            "font-size": "1pt",
            "margin": "2px",
            "padding": "1px"
        };
        const child_style: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt",
            "margin": "200px",
        };
        const expected: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt",
            "margin": "200px",
            "padding": "1px"
        }
        expect(applyOverlappingStyle(parent_style, child_style)).toEqual(expected);
        expect(applyOverlappingStyle(parent_style)).toEqual(parent_style);
        expect(applyOverlappingStyle(child_style)).toEqual(child_style);
    });
});

describe('Testing getStyleFromRoot', () => {
    test('span', () => {
        const nd = document.createElement("SPAN");
        document.body.style.fontStyle = "bold";
        document.body.appendChild(nd);

        expect(getStyleFromRoot(nd)["font-style"]).toBe("bold");
    });
});

describe('Testing combineNestedStyles', () => {
    test('only 1 style', () => {
        const style1: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt",
            "margin": "2px"
        };
        expect(combineNestedStyles(style1)).toEqual(style1);
    });

    test('same styles', () => {
        const style1: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt",
            "margin": "2px"
        };
        const style2 = {...style1};
        expect(combineNestedStyles(style1, style2)).toEqual(style1);
    });

    test('different styles', () => {
        const style1: CSSObj = {
            "font-weight": "bold",
            "font-size": "1pt",
            "margin": "2px",
            "padding": "1px"
        };
        const style2: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt",
            "margin": "200px",
        };
        const expected: CSSObj = {
            "font-weight": "bold",
            "font-size": undefinedStyle,
            "margin": undefinedStyle,
            "padding": undefinedStyle
        }
        expect(combineNestedStyles(style1, style2)).toEqual(expected);
    });
});

describe('Testing getNodeNestedStyle', () => {
    test('all styles are different', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-weight", "normal");

        nd1Span.style.setProperty("font-size", "12pt");
        nd2Span.style.setProperty("font-size", "8pt");

        const expected = {
            "font-weight": undefinedStyle,
            "font-size": undefinedStyle
        }

        expect(getNodeNestedStyle(commonNd, {}, [], [], false, false)).toEqual(expected);
    });

    test('all styles are same', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();

        commonNd.style.setProperty("font-weight", "bold");
        commonNd.style.setProperty("font-size", "12pt");
        nd1Span.style.setProperty("font-size", "12pt");
        nd2Span.style.setProperty("font-size", "12pt");

        const expected = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        expect(getNodeNestedStyle(commonNd, {}, [], [], false, false)).toEqual(expected);
    });

    test('with parent style', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");
        nd2Span.style.setProperty("font-size", "12pt");

        const expected = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        expect(getNodeNestedStyle(commonNd, {"font-size": "12pt"}, [], [], false, false)).toEqual(expected);
    });

    test('empty node', () => {
        const nd = document.createElement("SPAN");
        nd.style.setProperty("font-weight", "bold");

        expect(getNodeNestedStyle(nd, {"font-size": "12pt"}, [], [], false, false)).toBe(undefined);
    });

    test('with limit lists on', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");

        nd2Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-size", "8pt");

        const expected = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        const res = getNodeNestedStyle(
            commonNd, 
            {"font-size": "12pt"}, 
            [commonNd, nd1Span, nd1], 
            [commonNd, nd1Span, nd1], 
            true, 
            true)

        expect(res).toEqual(expected);
    });

    test('with limit lists off', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");

        nd2Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-size", "8pt");

        const expected = {
            "font-weight": undefinedStyle,
            "font-size": undefinedStyle
        }

        const res = getNodeNestedStyle(
            commonNd, 
            {"font-size": "12pt"}, 
            [commonNd, nd1Span, nd1], 
            [commonNd, nd1Span, nd1], 
            false, 
            false)

        expect(res).toEqual(expected);
    });
});

describe('Testing getNestedStyle', () => {
    test('undefined style', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd2,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        }

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");

        nd2Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-size", "8pt");

        const expectedStyle: CSSObj = {
            "font-weight": undefinedStyle,
            "font-size": undefinedStyle
        }

        const res = getNestedStyle(sel);
        
        expect(res).toEqual(expectedStyle);
    });

    test('defined style', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd1,
            endOffset: 5,
            commonNode: nd1Span,
            isEmpty: false
        }

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");

        nd2Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-size", "8pt");

        const expectedStyle: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        const res = getNestedStyle(sel);
        
        expect(res).toEqual(expectedStyle);
    });

    test('empty style', () => {
        const commonNd = document.createElement("SPAN");
        const nd = document.createElement("SPAN");
        commonNd.appendChild(nd);

        const sel: SelectionAdj = {
            startNode: nd,
            startOffset: 0,
            endNode: nd,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        }

        commonNd.style.setProperty("font-weight", "bold");

        const expectedStyle: CSSObj = {
            "font-weight": "bold",
        }

        const res = getNestedStyle(sel);
        
        expect(res).toEqual(expectedStyle);
    });

    test('empty selection(caret)', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd2,
            startOffset: 1,
            endNode: nd2,
            endOffset: 1,
            commonNode: nd2Span,
            isEmpty: true
        }

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");

        nd2Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-size", "8pt");

        const expectedStyle: CSSObj = {
            "font-weight": "normal",
            "font-size": "8pt"
        }

        const res = getNestedStyle(sel);
        
        expect(res).toEqual(expectedStyle);
    });
});

describe('Testing setStyle', () => {
    test('no middle node', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd2,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        setStyle(sel, stl);
        
        expect(nd1Span.style.fontWeight).toEqual("bold");
        expect(nd1Span.style.fontSize).toEqual("12pt");
    });

    test('single node selection', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd1,
            endOffset: 5,
            commonNode: nd1Span,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        setStyle(sel, stl);
        
        expect(nd1Span.style.fontWeight).toEqual("bold");
        expect(nd1Span.style.fontSize).toEqual("12pt");
        expect(nd2Span.style.fontWeight).toEqual("");
        expect(nd2Span.style.fontSize).toEqual("");
        expect(commonNd.style.fontWeight).toEqual("");
        expect(commonNd.style.fontSize).toEqual("");
    });

    test('empty selection', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 1,
            endNode: nd1,
            endOffset: 1,
            commonNode: nd1Span,
            isEmpty: true
        }

        const stl: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        setStyle(sel, stl);
        
        expect(nd1Span.style.fontWeight).toEqual("");
        expect(nd1Span.style.fontSize).toEqual("");
        expect(nd2Span.style.fontWeight).toEqual("");
        expect(nd2Span.style.fontSize).toEqual("");
        expect(commonNd.style.fontWeight).toEqual("");
        expect(commonNd.style.fontSize).toEqual("");
    });

    test('selection with start, middle and end', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd3,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        setStyle(sel, stl);
        
        expect(nd1Span.style.fontWeight).toEqual("bold");
        expect(nd1Span.style.fontSize).toEqual("12pt");
        expect(nd2Span.style.fontWeight).toEqual("bold");
        expect(nd2Span.style.fontSize).toEqual("12pt");
        expect(commonNd.childNodes.length).toEqual(5);
        // nd3 replaced with span
        expect(commonNd.childNodes[4].nodeName).toEqual("SPAN");
        expect((commonNd.childNodes[4] as HTMLElement).style.fontWeight).toEqual("bold");
        expect((commonNd.childNodes[4] as HTMLElement).style.fontSize).toEqual("12pt");
        expect(commonNd.childNodes[4].textContent).toEqual("test3");
    });

});

describe('Testing getNestedStyle', () => {
    test('undefined style', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd2,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        }

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");

        nd2Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-size", "8pt");

        const expectedStyle: CSSObj = {
            "font-weight": undefinedStyle,
            "font-size": undefinedStyle
        }

        const res = getNestedStyle(sel);
        
        expect(res).toEqual(expectedStyle);
    });

    test('defined style', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd1,
            endOffset: 5,
            commonNode: nd1Span,
            isEmpty: false
        }

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");

        nd2Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-size", "8pt");

        const expectedStyle: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        const res = getNestedStyle(sel);
        
        expect(res).toEqual(expectedStyle);
    });

    test('empty selection(caret)', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const sel: SelectionAdj = {
            startNode: nd2,
            startOffset: 1,
            endNode: nd2,
            endOffset: 1,
            commonNode: nd2Span,
            isEmpty: true
        }

        commonNd.style.setProperty("font-weight", "bold");
        nd1Span.style.setProperty("font-size", "12pt");

        nd2Span.style.setProperty("font-weight", "normal");
        nd2Span.style.setProperty("font-size", "8pt");

        const expectedStyle: CSSObj = {
            "font-weight": "normal",
            "font-size": "8pt"
        }

        const res = getNestedStyle(sel);
        
        expect(res).toEqual(expectedStyle);
    });
});

describe('Testing updateNodeStyle', () => {
    test('br', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3, br1, br2} = buildTree();

        const stl: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        const res = updateNodeStyle(br1, stl) as HTMLElement;
        
        expect(res.style.fontWeight).toEqual("");
        expect(res.style.fontSize).toEqual("");
    });

    test('single text node', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3, br1, br2} = buildTree();

        const stl: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        const res = updateNodeStyle(nd1, stl) as HTMLElement;
        
        expect(nd1Span.style.fontWeight).toEqual("bold");
        expect(nd1Span.style.fontSize).toEqual("12pt");
        expect(nd1Span.childNodes[0]).toEqual(nd1);
    });

    test('single text node, with siblings available', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3, br1, br2} = buildTree();
        nd1Span.appendChild(nd3);
        const stl: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        const res = updateNodeStyle(nd1, stl) as HTMLElement;
        
        expect(nd1Span.childNodes.length).toEqual(2);
        expect(nd1Span.childNodes[0].nodeName).toEqual("SPAN");
        expect((nd1Span.childNodes[0] as HTMLElement).style.fontWeight).toEqual("bold");
        expect((nd1Span.childNodes[0] as HTMLElement).style.fontSize).toEqual("12pt");
        expect(nd1Span.style.fontWeight).toEqual("");
        expect(nd1Span.style.fontSize).toEqual("");
    });

    test('span', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3, br1, br2} = buildTree();

        const stl: CSSObj = {
            "font-weight": "bold",
            "font-size": "12pt"
        }

        const res = updateNodeStyle(nd1Span, stl) as HTMLElement;
        
        expect(nd1Span.style.fontWeight).toEqual("bold");
        expect(nd1Span.style.fontSize).toEqual("12pt");
    });
});

describe('Testing resetChildrenStyle', () => {
    test('undefined style', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();

        commonNd.style.setProperty("font-weight", "bold");
        commonNd.style.setProperty("font-size", "9pt");
        nd1Span.style.setProperty("font-weight", "normal");
        nd1Span.style.setProperty("font-size", "8pt");
        nd2Span.style.setProperty("font-weight", "bold");
        nd2Span.style.setProperty("font-size", "5pt");

        const stl: CSSObj = {
            "font-size": "12pt"
        }

        const res = resetChildrenStyle(commonNd, stl);
        
        expect(commonNd.style.fontWeight).toEqual("bold");
        expect(commonNd.style.fontSize).toEqual("9pt");
        expect(nd1Span.style.fontWeight).toEqual("normal");
        expect(nd1Span.style.fontSize).toEqual("");
        expect(nd2Span.style.fontWeight).toEqual("bold");
        expect(nd2Span.style.fontSize).toEqual("");
    });
});


describe('Testing setStyleFromStart', () => {
    test('no next sibling', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const nd11 = document.createTextNode("test11");
        nd1Span.appendChild(nd11);

        commonNd.style.setProperty("font-size", "9pt");
        nd1Span.style.setProperty("font-size", "8pt");
        nd2Span.style.setProperty("font-size", "5pt");

        const sel: SelectionAdj = {
            startNode: nd11,
            startOffset: 0,
            endNode: nd3,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-size": "12pt"
        }

        expect(nd1Span.childNodes[1].nodeType).toEqual(Node.TEXT_NODE);

        const res = setStyleFromStart(sel, stl);

        expect(res).toEqual(nd1Span);
        expect(nd1Span.childNodes[0].nodeType).toEqual(Node.TEXT_NODE);
        expect(nd1Span.childNodes[1].nodeName).toEqual("SPAN");
        expect((nd1Span.childNodes[1] as HTMLElement).style.fontSize).toEqual("12pt");
        
        expect(commonNd.style.fontSize).toEqual("9pt");
        expect(nd1Span.style.fontSize).toEqual("8pt");
        expect(nd2Span.style.fontSize).toEqual("5pt");
    });

    test('there is next sibling', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const nd11 = document.createTextNode("test11");
        nd1Span.appendChild(nd11);

        commonNd.style.setProperty("font-size", "9pt");
        nd1Span.style.setProperty("font-size", "8pt");
        nd2Span.style.setProperty("font-size", "5pt");

        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd3,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-size": "12pt"
        }

        expect(nd1Span.childNodes[1].nodeType).toEqual(Node.TEXT_NODE);

        const res = setStyleFromStart(sel, stl);

        expect(res).toEqual(nd1Span);
        expect(nd1Span.childNodes[0].nodeName).toEqual("SPAN");
        expect(nd1Span.childNodes[1].nodeName).toEqual("SPAN");
        expect((nd1Span.childNodes[0] as HTMLElement).style.fontSize).toEqual("12pt");
        expect((nd1Span.childNodes[1] as HTMLElement).style.fontSize).toEqual("12pt");
        
        expect(commonNd.style.fontSize).toEqual("9pt");
        expect(nd1Span.style.fontSize).toEqual("8pt");
        expect(nd2Span.style.fontSize).toEqual("5pt");
    });

    test('wrong common node.', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const nd11 = document.createTextNode("test11");
        nd1Span.appendChild(nd11);
        const rootNd = document.createElement("SPAN");
        rootNd.appendChild(commonNd);

        commonNd.style.setProperty("font-size", "9pt");
        nd1Span.style.setProperty("font-size", "8pt");
        nd2Span.style.setProperty("font-size", "5pt");

        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd3,
            endOffset: 5,
            commonNode: nd3,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-size": "12pt"
        }

        expect(nd1Span.childNodes[1].nodeType).toEqual(Node.TEXT_NODE);

        const res = setStyleFromStart(sel, stl);

        expect(nd1Span.childNodes[0].nodeName).toEqual("SPAN");
        expect(nd1Span.childNodes[1].nodeName).toEqual("SPAN");
        expect((nd1Span.childNodes[0] as HTMLElement).style.fontSize).toEqual("12pt");
        expect((nd1Span.childNodes[1] as HTMLElement).style.fontSize).toEqual("12pt");
        
        expect(commonNd.style.fontSize).toEqual("9pt");
        expect(nd1Span.style.fontSize).toEqual("8pt");
        // because of wrong common node
        expect(nd2Span.style.fontSize).toEqual("12pt");
        expect(res).toEqual(rootNd);
    });
});


describe('Testing setStyleFromEnd', () => {
    test('no previous sibling', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const nd22 = document.createTextNode("test22");
        nd2Span.appendChild(nd22);

        commonNd.style.setProperty("font-size", "9pt");
        nd1Span.style.setProperty("font-size", "8pt");
        nd2Span.style.setProperty("font-size", "5pt");

        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd2,
            endOffset: 5,
            commonNode: commonNd,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-size": "12pt"
        }

        expect(nd2Span.childNodes[0].nodeType).toEqual(Node.TEXT_NODE);

        const res = setStyleFromEnd(sel, stl);

        expect(res).toEqual(nd2Span);
        expect(nd2Span.childNodes[1].nodeType).toEqual(Node.TEXT_NODE); //nd22
        expect(nd2Span.childNodes[0].nodeName).toEqual("SPAN"); //nd2
        expect((nd2Span.childNodes[0] as HTMLElement).style.fontSize).toEqual("12pt");
        
        expect(commonNd.style.fontSize).toEqual("9pt");
        expect(nd1Span.style.fontSize).toEqual("8pt");
        expect(nd2Span.style.fontSize).toEqual("5pt");
    });

    test('there is previous sibling', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const nd22= document.createTextNode("test22");
        nd2Span.appendChild(nd22);

        commonNd.style.setProperty("font-size", "9pt");
        nd1Span.style.setProperty("font-size", "8pt");
        nd2Span.style.setProperty("font-size", "5pt");

        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd22,
            endOffset: 6,
            commonNode: commonNd,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-size": "12pt"
        }

        expect(nd2Span.childNodes[0].nodeType).toEqual(Node.TEXT_NODE);

        const res = setStyleFromEnd(sel, stl);

        expect(res).toEqual(nd2Span);
        expect(nd2Span.childNodes[0].nodeName).toEqual("SPAN");
        expect(nd2Span.childNodes[1].nodeName).toEqual("SPAN");
        expect((nd2Span.childNodes[0] as HTMLElement).style.fontSize).toEqual("12pt");
        expect((nd2Span.childNodes[1] as HTMLElement).style.fontSize).toEqual("12pt");
        
        expect(commonNd.style.fontSize).toEqual("9pt");
        expect(nd1Span.style.fontSize).toEqual("8pt");
        expect(nd2Span.style.fontSize).toEqual("5pt");
    });

    test('wrong common node.', () => {
        const {commonNd, nd1Span, nd2Span, nd1, nd2, nd3} = buildTree();
        const nd22= document.createTextNode("test22");
        nd2Span.appendChild(nd22);
        const rootNd = document.createElement("SPAN");
        rootNd.appendChild(commonNd);

        commonNd.style.setProperty("font-size", "9pt");
        nd1Span.style.setProperty("font-size", "8pt");
        nd2Span.style.setProperty("font-size", "5pt");

        const sel: SelectionAdj = {
            startNode: nd1,
            startOffset: 0,
            endNode: nd2,
            endOffset: 5,
            commonNode: nd3,
            isEmpty: false
        }

        const stl: CSSObj = {
            "font-size": "12pt"
        }

        expect(nd2Span.childNodes[0].nodeType).toEqual(Node.TEXT_NODE);

        const res = setStyleFromEnd(sel, stl);

        expect(nd2Span.childNodes[0].nodeName).toEqual("SPAN");
        expect(nd2Span.childNodes[1].nodeType).toEqual(Node.TEXT_NODE);
        expect((nd2Span.childNodes[0] as HTMLElement).style.fontSize).toEqual("12pt");
        
        expect(commonNd.style.fontSize).toEqual("9pt");
        expect(nd2Span.style.fontSize).toEqual("5pt");
        // because of wrong common node
        expect(nd1Span.style.fontSize).toEqual("12pt");
        expect(res).toEqual(rootNd);
    });
});

describe('Testing compareChildStyle', () => {
    test('parent style is undefined', () => {
        const child_style: CSSObj = {
            "font-weight": "bold",
        };

        expect(compareChildStyle(undefined, child_style)).toBe(false);
    });

    test('child style is same', () => {
        const parent_style: CSSObj = {
            "font-weight": "bold",
            "font-size": "1pt",
            "margin": "2px",
            "padding": "1px"
        };
        const child_style: CSSObj = {
            "font-weight": "bold",
            "margin": "2px",
        };

        expect(compareChildStyle(parent_style, child_style)).toBe(true);
    });

    test('child style is different', () => {
        const parent_style: CSSObj = {
            "font-weight": "bold",
            "font-size": "1pt",
            "margin": "2px",
            "padding": "1px"
        };
        const child_style: CSSObj = {
            "font-weight": "normal",
            "margin": "12px",
        };
        expect(compareChildStyle(parent_style, child_style)).toBe(false);
    });

    test('child style contains different property', () => {
        const parent_style: CSSObj = {
            "margin": "2px",
            "padding": "1px"
        };
        const child_style: CSSObj = {
            "font-weight": "normal",
            "margin": "2px",
        };
        expect(compareChildStyle(parent_style, child_style)).toBe(false);
    });
});


describe('Testing compareChildStyle', () => {
    test('different length', () => {
        const style1: CSSObj = {
            "font-weight": "bold",
            "font-size": "1pt",
            "margin": "2px",
            "padding": "1px"
        };
        const style2: CSSObj = {
            "font-weight": "bold",
        };
        expect(compareNodeStyles(style1, style2)).toBe(false);
    });

    test('same length, different style', () => {
        const style1: CSSObj = {
            "font-weight": "bold",
            "font-size": "1pt"
        };
        const style2: CSSObj = {
            "font-weight": "bold",
            "font-size": "9pt",
        };
        expect(compareNodeStyles(style1, style2)).toBe(false);
    });

    test('same length, same style', () => {
        const style1: CSSObj = {
            "font-weight": "bold",
            "font-size": "1pt"
        };
        const style2: CSSObj = {
            "font-weight": "bold",
            "font-size": "1pt",
        };
        expect(compareNodeStyles(style1, style2)).toBe(true);
    });
});
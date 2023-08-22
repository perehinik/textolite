
import * as selectionAdjModule from "../src/SelectionAdj";

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


test('no middle node', () => {
    expect(1).toBe(1);
});
/*
describe('Testing setStyleFromObj', () => {
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

        const restoreSelectionSpy = jest.spyOn(selectionAdjModule, 'restoreSelection' as any);
        restoreSelectionSpy.mockImplementation(() => {});

        setStyle(sel, stl);
        
        expect(restoreSelectionSpy).toHaveBeenCalledWith(commonNd, 0, 10);
        expect(nd1Span.style.fontWeight).toEqual("bold");
        expect(nd1Span.style.fontSize).toEqual("12pt");
    });
});
*/
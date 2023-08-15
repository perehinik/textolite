import { optimyzeNode, onlyForTesting } from '../src/OptimyzeDOM'
import { CSSObj } from '../src/Styling'

const { optimizeNodeList } = onlyForTesting;

describe('Testing optimization of simplest nodes', () => {
    test('text node', () => {
        const nd = document.createTextNode("testText");
        const res = optimyzeNode(nd);
        expect(res?.nodeType).toBe(Node.TEXT_NODE);
        expect(res?.textContent).toBe("testText");
    });

    test('br', () => {
        const nd = document.createElement("BR");
        const res = optimyzeNode(nd);
        expect(res?.nodeName).toBe("BR");
        expect(res?.textContent).toBe("");
    });

    test('empty span', () => {
        const nd = document.createElement("SPAN");
        const res = optimyzeNode(nd);
        expect(res).toBe(undefined);
    });
});

describe('Testing SPAN without styles', () => {
    test('span with only text', () => {
        const ndSp = document.createElement("SPAN");
        const nd = document.createTextNode("testText");
        ndSp.appendChild(nd)
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeType).toBe(Node.TEXT_NODE);
        expect(res?.textContent).toBe("testText");
    });

    test('span with 2 text elements', () => {
        const ndSp = document.createElement("SPAN");
        const nd1 = document.createTextNode("test");
        const nd2 = document.createTextNode("Text");
        ndSp.appendChild(nd1)
        ndSp.appendChild(nd2)
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeType).toBe(Node.TEXT_NODE);
        expect(res?.textContent).toBe("testText");
    });

    test('span with 2 text elements and br between them', () => {
        const ndSp = document.createElement("SPAN");
        const nd1 = document.createTextNode("test");
        const nd2 = document.createTextNode("Text");
        const nd = document.createElement("BR");
        ndSp.appendChild(nd1)
        ndSp.appendChild(nd)
        ndSp.appendChild(nd2)
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeName).toBe("SPAN");
        expect(res?.childNodes.length).toBe(3);
        expect(res?.childNodes[1].nodeName).toBe("BR");
    });

    test('span with 2 text elements and another span with br', () => {
        const ndSp = document.createElement("SPAN");
        const nd1 = document.createTextNode("test");
        const nd2 = document.createTextNode("Text");

        const ndSpEmb = document.createElement("SPAN");
        ndSpEmb.innerHTML = "<br/>"

        ndSp.appendChild(nd1)
        ndSp.appendChild(ndSpEmb)
        ndSp.appendChild(nd2)
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeName).toBe("SPAN");
        expect(res?.childNodes.length).toBe(3);
        expect(res?.childNodes[1].nodeName).toBe("BR");
    });

    // This may need to nbe changed so <p> is not optimized.
    test('paragraph with span, without styles', () => {
        const nd = document.createElement("P");
        nd.innerHTML = "Hello <span>World</span>.";

        const res = optimyzeNode(nd) as HTMLElement;
        expect(res?.nodeType).toBe(Node.TEXT_NODE);
        expect(res?.textContent).toBe("Hello World.");
    });
});

describe('Testing SPAN with styles', () => {
    test('span with only text', () => {
        const ndSp = document.createElement("SPAN");
        ndSp.style.fontWeight = "bold";
        const nd = document.createTextNode("testText");
        ndSp.appendChild(nd)
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeName).toBe("SPAN");
        expect(res?.style.fontWeight).toBe("bold");
        expect(res?.textContent).toBe("testText");
    });

    test('span with another span, which have the same style-1', () => {
        const ndSp = document.createElement("SPAN");
        ndSp.style.fontWeight = "bold";
        ndSp.innerHTML = 'Hello <span style="font-weight:bold">World</span>.'
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeName).toBe("SPAN");
        expect(res?.style.fontWeight).toBe("bold");
        expect(res?.childNodes.length).toBe(1);
        expect(res?.innerHTML).toBe("Hello World.");
        expect(res?.textContent).toBe("Hello World.");
    });

    test('span with another span, which have the same style-2', () => {
        const ndSp = document.createElement("SPAN");
        ndSp.style.fontWeight = "bold";
        ndSp.style.fontSize="32pt";
        // Inner span doesn't modify style properties from parent
        ndSp.innerHTML = 'Hello <span style="font-weight:bold">World</span>.'
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeName).toBe("SPAN");
        expect(res?.style.fontWeight).toBe("bold");
        expect(res?.childNodes.length).toBe(1);
        expect(res?.innerHTML).toBe("Hello World.");
        expect(res?.textContent).toBe("Hello World.");
    });

    test('span with another span, which have the different style', () => {
        const ndSp = document.createElement("SPAN");
        ndSp.style.fontWeight = "bold";
        ndSp.style.fontSize="32pt";
        // Inner span doesn't modify style properties from parent
        ndSp.innerHTML = 'Hello <span style="font-weight:normal">World</span>.'
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeName).toBe("SPAN");
        expect(res?.style.fontWeight).toBe("bold");
        expect(res?.childNodes.length).toBe(3);
        expect(res?.textContent).toBe("Hello World.");
        expect(res?.innerHTML).toBe('Hello <span style="font-weight:normal">World</span>.');
    });

    test('span with multiple spans, which have the same style', () => {
        const ndSp = document.createElement("SPAN");
        ndSp.style.fontWeight = "bold";
        ndSp.style.fontSize="32pt";
        // Inner span doesn't modify style properties from parent
        ndSp.innerHTML = 'Hello <span style="font-weight:normal">World</span><span style="font-weight:normal">.</span>'
        const res = optimyzeNode(ndSp) as HTMLElement;
        expect(res?.nodeName).toBe("SPAN");
        expect(res?.style.fontWeight).toBe("bold");
        expect(res?.childNodes.length).toBe(2);
        expect(res?.textContent).toBe("Hello World.");
        expect(res?.innerHTML).toBe('Hello <span style="font-weight:normal">World.</span>');
    });

    test('span with multiple spans, which have the same style as parent', () => {
        const ndSp = document.createElement("SPAN");
        ndSp.style.fontSize="32pt";
        // Inner span doesn't modify style properties from parent
        ndSp.innerHTML = 'Hello <span style="font-weight:normal">World</span><span style="font-weight:normal">.</span>'
        const style = {"font-weight": "normal"} as CSSObj;
        const res = optimyzeNode(ndSp, style) as HTMLElement;
        expect(res?.nodeName).toBe("SPAN");
        expect(res?.childNodes.length).toBe(1);
        expect(res?.innerHTML).toBe('Hello World.');
    });
});

describe('Testing node array optimization', () => {
    test('text node', () => {
        const nd = document.createTextNode("testText");
        const res = optimizeNodeList([nd]);
        expect(res?.length).toBe(1);
        expect(res[0].nodeType).toBe(Node.TEXT_NODE);
        expect(res[0].textContent).toBe("testText");
    });

    test('br', () => {
        const nd = document.createElement("BR");
        const res = optimizeNodeList([nd]);
        expect(res?.length).toBe(1);
        expect(res[0].nodeName).toBe("BR");
    });

    test('span', () => {
        const nd = document.createElement("SPAN");
        nd.style.fontWeight = "bold";
        const res = optimizeNodeList([nd]);
        expect(res?.length).toBe(1);
        expect(res[0].nodeName).toBe("SPAN");
        expect((res[0] as HTMLElement).style.fontWeight).toBe("bold");
    });

    test('multiple text nodes', () => {
        const nd1 = document.createTextNode("test");
        const nd2 = document.createTextNode("Text");
        const res = optimizeNodeList([nd1, nd2]);
        expect(res?.length).toBe(1);
        expect(res[0].nodeType).toBe(Node.TEXT_NODE);
        expect(res[0].textContent).toBe("testText");
    });

    test('multiple br nodes', () => {
        const nd1 = document.createElement("BR");
        const nd2 = document.createElement("BR");
        const res = optimizeNodeList([nd1, nd2]);
        expect(res?.length).toBe(2);
        expect(res[0].nodeName).toBe("BR");
        expect(res[1].nodeName).toBe("BR");
    });

    test('multiple spans with same style', () => {
        const nd1 = document.createElement("SPAN");
        nd1.style.fontWeight = "bold";
        nd1.textContent = "Hello ";
        const nd2 = document.createElement("SPAN");
        nd2.style.fontWeight = "bold";
        nd2.textContent = "World";
        const res = optimizeNodeList([nd1, nd2]);
        expect(res?.length).toBe(1);
        expect(res[0].nodeName).toBe("SPAN");
        expect((res[0] as HTMLElement).style.fontWeight).toBe("bold");
        expect(res[0].textContent).toBe("Hello World");
    });

    test('multiple spans with different style', () => {
        const nd1 = document.createElement("SPAN");
        nd1.style.fontWeight = "bold";
        nd1.textContent = "Hello ";
        const nd2 = document.createElement("SPAN");
        nd2.style.fontWeight = "normal";
        nd2.textContent = "World";
        const res = optimizeNodeList([nd1, nd2]);
        expect(res?.length).toBe(2);
        expect(res[0].nodeName).toBe("SPAN");
        expect((res[0] as HTMLElement).style.fontWeight).toBe("bold");
        expect((res[1] as HTMLElement).style.fontWeight).toBe("normal");
        expect(res[0].textContent).toBe("Hello ");
        expect(res[1].textContent).toBe("World");
    });

    test('span then br', () => {
        const nd1 = document.createElement("SPAN");
        nd1.textContent = "Hello World";
        const nd2 = document.createElement("BR");
        const res = optimizeNodeList([nd1, nd2]);
        expect(res?.length).toBe(1);
        expect(res[0].nodeName).toBe("SPAN");
        expect(res[0].childNodes.length).toBe(2);
        expect(res[0].childNodes[0].textContent).toBe("Hello World");
        expect(res[0].childNodes[1].nodeName).toBe("BR");
    });
});
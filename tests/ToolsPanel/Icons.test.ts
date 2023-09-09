import { buildSVG } from "../../src/ToolsPanel/Icons";

describe('Testing buildSVG', () => {
    test('svg without size', () => {
        const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 4H21V6H3V4ZM3 19H21V21H3V19ZM3 14H21V16H3V14ZM3 9H21V11H3V9Z"></path></svg>';
        
        const result = buildSVG(icon);

        expect(result.nodeName.toUpperCase()).toBe("SVG");
        expect(result.outerHTML).toEqual(icon);
    });

    test('svg with size', () => {
        const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 4H21V6H3V4ZM3 19H21V21H3V19ZM3 14H21V16H3V14ZM3 9H21V11H3V9Z"></path></svg>';
        
        const result = buildSVG(icon, "20", "30");

        expect(result.nodeName.toUpperCase()).toBe("SVG");
        expect(result.outerHTML).toEqual(icon);
        // expect(result.style).toEqual("20");
        // expect(result.style.height).toEqual("30");
    });

    test('empty svg', () => {
        const result = buildSVG("");

        expect(result.nodeName.toUpperCase()).toBe("SVG");
        expect(result.innerHTML).toEqual("");
    });
});
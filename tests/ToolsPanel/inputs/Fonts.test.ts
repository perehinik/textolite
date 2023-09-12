import { getAvailableFonts } from "../../../src/ToolsPanel/Inputs/Fonts";

function fontsCheckMock(font: string) {
    const availableFonts = ['12px "Arial"', '12px "Times New Roman"'];
    return availableFonts.includes(font);
}

beforeAll(() => {
    Object.defineProperty(document, 'fonts', {
        value: { 
            ready: Promise.resolve({}),
            check: fontsCheckMock
        },
    })
});

describe('Testing getAvailableFonts', () => {
    test('', () => {
        const fonts = getAvailableFonts();

        expect(fonts).toHaveLength(2);
        expect(fonts).toContain("Arial");
        expect(fonts).toContain("Times New Roman");
    });
});
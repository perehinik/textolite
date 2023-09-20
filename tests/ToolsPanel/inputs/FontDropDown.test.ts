import { FontDropDown } from "../../../src/ToolsPanel/Inputs/FontDropDown";
import * as fontsModue from "../../../src/ToolsPanel/Inputs/Fonts";

const onStateChangeMock = jest.fn().mockImplementation(() => {});
const getAvailableFontsMock = jest.spyOn(fontsModue, 'getAvailableFonts' as any);
const availableFonts = ["Arial", "Times New Roman"];

function buildFontDropDown() {
    const dropDownButton =  new FontDropDown(onStateChangeMock);
    onStateChangeMock.mockReset();
    return dropDownButton;
}

beforeEach(() => {
    onStateChangeMock.mockReset();
    getAvailableFontsMock.mockReturnValue( availableFonts );
});

afterEach(() => {
    onStateChangeMock.mockReset();
    getAvailableFontsMock.mockReset();
});

describe('Testing constructor', () => {
    test('', () => {
        const fontDropDown = buildFontDropDown();

        expect(fontDropDown.availableFonts).toHaveLength(2);
        expect(fontDropDown.Element.nodeName.toUpperCase()).toBe("DIV");
        expect(fontDropDown.currentFont).toBe("");
    });
});

describe('Testing buildFontsDropDown', () => {
    test('', () => {
        const fontDropDown = buildFontDropDown();
        const buuildButtonMock = jest.fn().mockImplementation(()=>{return document.createElement("DIV")});
        fontDropDown.buildFontButton = buuildButtonMock;

        const result = fontDropDown.buildFontsDropDown();

        expect(fontDropDown.availableFonts).toHaveLength(2);
        expect(result.nodeName.toUpperCase()).toBe("DIV");
        expect(result.childNodes.length).toBe(4);
        expect(result.childNodes[0].nodeName.toUpperCase()).toBe("STYLE");
        expect(result.childNodes[1].nodeName.toUpperCase()).toBe("DIV");

        expect(buuildButtonMock.mock.calls).toHaveLength(2);
    });
});

describe('Testing addLatestFont', () => {
    test('invalid font', () => {
        const fontDropDown = buildFontDropDown();
        
        fontDropDown.addLatestFont("Wrong Font")

        expect(fontDropDown.latestFonts).toHaveLength(0);
    });

    test('font already in latest list.', () => {
        const fontDropDown = buildFontDropDown();
        fontDropDown.latestFonts = ["Arial"];
        expect(fontDropDown.latestFonts).toHaveLength(1);
        fontDropDown.addLatestFont("Arial");
        expect(fontDropDown.latestFonts).toHaveLength(1);
    });

    test('add new latest font node', () => {
        const fontDropDown = buildFontDropDown();
        expect(fontDropDown.latestFonts).toHaveLength(0);
        const fontName = "Arial";
        fontDropDown.addLatestFont(fontName)
        expect(fontDropDown.latestFonts).toHaveLength(1);
        expect(fontDropDown.latestFonts[0]).toBe(fontName);
        expect(fontDropDown.latestFontsContainer.childNodes).toHaveLength(1);
        const latestFontButton = fontDropDown.latestFontsContainer.childNodes[0];
        expect(latestFontButton.textContent).toBe(fontName);
    });

    test('overwrite font node', () => {
        const fontDropDown = buildFontDropDown();
        fontDropDown.latestFonts = ["Latest font"];
        fontDropDown.latestFontsContainer.appendChild(document.createElement("DIV"));
        fontDropDown.latestFontsId = 0;

        const fontName = "Times New Roman";
        fontDropDown.addLatestFont(fontName)
        expect(fontDropDown.latestFonts).toHaveLength(1);
        expect(fontDropDown.latestFonts[0]).toBe(fontName);
        expect(fontDropDown.latestFontsContainer.childNodes).toHaveLength(1);
        const latestFontButton = fontDropDown.latestFontsContainer.childNodes[0];
        expect(latestFontButton.textContent).toBe(fontName);
    });
});

describe('Testing buildSplitter', () => {
    test('', () => {
        const fontDropDown = buildFontDropDown();

        const result = fontDropDown.builldSplitter();

        expect(result.nodeName.toUpperCase()).toBe("DIV");
        expect(result.style.width).toBe("100%");
    });
});

describe('Testing buildFontWidget', () => {
    test('', () => {
        const fontDropDown = buildFontDropDown();

        const result = fontDropDown.buildFontWidget();

        expect(result.nodeName.toUpperCase()).toBe("DIV");
    });
});

describe('Testing buildFontButton', () => {
    test('', () => {
        const fontDropDown = buildFontDropDown();

        const fontName = "Arial";
        const result = fontDropDown.buildFontButton(fontName);

        expect(result.nodeName.toUpperCase()).toBe("DIV");
        expect(result.classList[0]).toBe("fontButtonStyle");
        expect(result.textContent).toBe(fontName);
    });
});

describe('Testing setFontByStyle', () => {
    test('test 1', () => {
        const fontDropDown = buildFontDropDown();
        const fontName = "Arial";
        fontDropDown.setStateByStyle({"font-family": fontName});

        expect(fontDropDown.currentFont).toBe(fontName);
        expect(fontDropDown.fontWidget.textContent).toBe(fontName);
    });

    test('wrong font', () => {
        const fontDropDown = buildFontDropDown();
        fontDropDown.setStateByStyle({"font-family": "wrong font"});

        expect(fontDropDown.currentFont).toBe("");
        expect(fontDropDown.fontWidget.textContent).toBe("");
    });

    test('no font', () => {
        const fontDropDown = buildFontDropDown();
        fontDropDown.setStateByStyle({"color": "white"});

        expect(fontDropDown.currentFont).toBe("");
        expect(fontDropDown.fontWidget.textContent).toBe("");
    });
});

describe('Testing onClickHandler', () => {
    test('Button click', () => {
        const fontDropDown = buildFontDropDown();

        const event = new CustomEvent("click", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;

        const arrowSetStateMock = jest.fn().mockImplementation(() => {});
        fontDropDown.dropDownArrow.setState = arrowSetStateMock;
        
        fontDropDown.button.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(1);
        expect(stopPropagationMock.mock.calls).toHaveLength(1);
        expect(arrowSetStateMock.mock.calls).toHaveLength(1);
    });
});

describe('Testing onClickHandler', () => {
    test('', () => {
        const fontDropDown = buildFontDropDown();
        fontDropDown.latestFonts = ["Times New Roman"];
        const onStateChangeMock = jest.fn().mockImplementation(() => {});
        fontDropDown.onStateChange = onStateChangeMock;

        fontDropDown.latestFontChosen(0);

        expect(onStateChangeMock.mock.calls).toHaveLength(1);
        expect(onStateChangeMock.mock.calls[0][0]).toEqual({"font-family": "Times New Roman"});
    });
});

describe('Testing fontChanged', () => {
    test('Button click', () => {
        const fontDropDown = buildFontDropDown();
        const fontName = "Times New Roman";
        const onStateChangeMock = jest.fn().mockImplementation(() => {});
        fontDropDown.onStateChange = onStateChangeMock;
        const addLatestFontMock = jest.fn().mockImplementation(() => {});
        fontDropDown.addLatestFont = addLatestFontMock;

        fontDropDown.fontChanged(fontName);

        expect(onStateChangeMock.mock.calls).toHaveLength(1);
        expect(onStateChangeMock.mock.calls[0][0]).toEqual({"font-family": fontName});
        expect(addLatestFontMock.mock.calls).toHaveLength(1);
        expect(addLatestFontMock.mock.calls[0][0]).toEqual(fontName);
    });
});

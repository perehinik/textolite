import { FontSizeDropDown } from "../../../src/ToolsPanel/Inputs/FontSizeDropDown";

const onStateChangeMock = jest.fn().mockImplementation(() => {});

function buildFontSizeDropDown() {
    const dropDownButton =  new FontSizeDropDown(onStateChangeMock);
    onStateChangeMock.mockReset();
    return dropDownButton;
}

beforeEach(() => {
    onStateChangeMock.mockReset();
});

afterEach(() => {
    onStateChangeMock.mockReset();
});

describe('Testing constructor', () => {
    test('', () => {
        const fontSizeDropDown = buildFontSizeDropDown();

        expect(fontSizeDropDown.availableSizes).toHaveLength(21);
        expect(fontSizeDropDown.Element.nodeName.toUpperCase()).toBe("DIV");
        expect(fontSizeDropDown.currentFontSize).toBe("");
    });
});

describe('Testing buildFontsDropDown', () => {
    test('', () => {
        const fontSizeDropDown = buildFontSizeDropDown();
        const buuildButtonMock = jest.fn().mockImplementation(()=>{return document.createElement("DIV")});
        fontSizeDropDown.buildFontSizeButton = buuildButtonMock;

        const result = fontSizeDropDown.buildFontSizeDropDown();

        const availableSizesLen = fontSizeDropDown.availableSizes.length;
        expect(fontSizeDropDown.availableSizes).toHaveLength(availableSizesLen);
        expect(result.childNodes.length).toBe(availableSizesLen + 1);
        expect(result.childNodes[0].nodeName.toUpperCase()).toBe("STYLE");

        expect(buuildButtonMock.mock.calls).toHaveLength(availableSizesLen);
    });
});

describe('Testing buildFontSizeWidget', () => {
    test('', () => {
        const fontSizeDropDown = buildFontSizeDropDown();

        const result = fontSizeDropDown.buildFontSizeWidget();

        expect(result.nodeName.toUpperCase()).toBe("DIV");
    });
});

describe('Testing buildFontButton', () => {
    test('', () => {
        const fontSizeDropDown = buildFontSizeDropDown();

        const fontSize = "12pt";
        const result = fontSizeDropDown.buildFontSizeButton(fontSize);

        expect(result.nodeName.toUpperCase()).toBe("DIV");
        expect(result.classList[0]).toBe("fontButtonStyle");
        expect(result.textContent).toBe(fontSize);
    });
});

describe('Testing setStateByStyle', () => {
    test('test 1', () => {
        const fontSizeDropDown = buildFontSizeDropDown();
        const fontSizeName = "12pt";
        fontSizeDropDown.setStateByStyle({"font-size": fontSizeName});

        expect(fontSizeDropDown.currentFontSize).toBe(fontSizeName);
        expect(fontSizeDropDown.fontSizeWidget.textContent).toBe(fontSizeName);
    });

    test('wrong font', () => {
        const fontDropDown = buildFontSizeDropDown();
        fontDropDown.setStateByStyle({"font-size": "wrong font size"});

        expect(fontDropDown.currentFontSize).toBe("");
        expect(fontDropDown.fontSizeWidget.textContent).toBe("");
    });

    test('no font', () => {
        const fontDropDown = buildFontSizeDropDown();
        fontDropDown.setStateByStyle({"color": "white"});

        expect(fontDropDown.currentFontSize).toBe("");
        expect(fontDropDown.fontSizeWidget.textContent).toBe("");
    });
});

describe('Testing onClickHandler', () => {
    test('Button click', () => {
        const fontDropDown = buildFontSizeDropDown();

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

describe('Testing fontSizeChanged', () => {
    test('Button click', () => {
        const fontSizeDropDown = buildFontSizeDropDown();
        const fontSize = "16pt";
        const onStateChangeMock = jest.fn().mockImplementation(() => {});
        fontSizeDropDown.onStateChange = onStateChangeMock;

        fontSizeDropDown.fontSizeChanged(fontSize);

        expect(onStateChangeMock.mock.calls).toHaveLength(1);
        expect(onStateChangeMock.mock.calls[0][0]).toEqual({"font-size": fontSize});
    });
});

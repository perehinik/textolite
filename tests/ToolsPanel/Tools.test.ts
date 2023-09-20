import { CSSObj } from "../../src/Styling";
import { Tools } from "../../src/ToolsPanel/Tools";
import * as fontsModue from "../../src/ToolsPanel/Inputs/Fonts"

const onStyleChange = jest.fn();
const getAvailableFontsMock = jest.spyOn(fontsModue, 'getAvailableFonts' as any);

const buildTools = () => {
    getAvailableFontsMock.mockImplementation(()=>{return ["Arial", "Times New Roman"]});
    const toolsContainer = document.createElement("div");
    const tools = new Tools(toolsContainer, onStyleChange);
    onStyleChange.mockReset();

    return {tools, toolsContainer, onStyleChange};
}

afterEach(() => {
    onStyleChange.mockReset();
    getAvailableFontsMock.mockReset();
});

describe('Testing constructor', () => {
    test('constructor', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();

        expect(tools.onStyleChange).toEqual(onStyleChange);
        expect(toolsContainer.childNodes.length).toBe(13);
    });

    test('bold button', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();

        expect(tools.boldButton.valueOn).toEqual({'font-weight': 'bold'});
        expect(tools.boldButton.valueOff).toEqual({'font-weight': 'normal'});
        expect(tools.boldButton.Element.firstChild?.nodeName.toUpperCase()).toEqual("SVG");
        expect(tools.boldButton.onStateChange).toEqual(tools.styleChanged);
    });

    test('italic button', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();

        expect(tools.italicButton.valueOn).toEqual({'font-style': 'italic'});
        expect(tools.italicButton.valueOff).toEqual({'font-style': 'normal'});
        expect(tools.italicButton.Element.firstChild?.nodeName.toUpperCase()).toEqual("SVG");
        expect(tools.italicButton.onStateChange).toEqual(tools.styleChanged);
    });

    test('underline button', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();

        expect(tools.underlineButton.valueOn).toEqual({'text-decoration': 'underline'});
        expect(tools.underlineButton.valueOff).toEqual({'text-decoration': 'none'});
        expect(tools.underlineButton.Element.firstChild?.nodeName.toUpperCase()).toEqual("SVG");
        expect(tools.underlineButton.onStateChange).toEqual(tools.styleChanged);
    });
});

describe('Testing styleChanged', () => {
    test('', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();
        const style: CSSObj = {"font-size": "12pt"};
        onStyleChange.mockImplementation(() => {});

        tools.styleChanged(style);

        expect(onStyleChange.mock.calls).toHaveLength(1);
        expect(onStyleChange.mock.calls[0][0]).toEqual(style);
    });
});

describe('Testing silentUpdate', () => {
    test('bold false, italic true', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();
        onStyleChange.mockImplementation(() => {});
        const style: CSSObj = {
            "font-style": "italic", 
            "font-weight": "*x*"
        };
        const setStyleItalicMock = jest.fn().mockImplementation(() => {});
        tools.italicButton.setState = setStyleItalicMock ;
        const setStyleBoldMock = jest.fn().mockImplementation(() => {});
        tools.boldButton.setState = setStyleBoldMock ;

        tools.silentUpdate(style);

        expect(onStyleChange.mock.calls).toHaveLength(0);
        expect(setStyleItalicMock.mock.calls).toHaveLength(1);
        expect(setStyleItalicMock.mock.calls[0][0]).toBe(true);
        expect(setStyleBoldMock.mock.calls).toHaveLength(1);
        expect(setStyleBoldMock.mock.calls[0][0]).toBe(false);
    });

    test('bold true, italic false', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();
        onStyleChange.mockImplementation(() => {});
        const style: CSSObj = {
            "font-style": "normal", 
            "font-weight": "bold"
        };
        const setStyleItalicMock = jest.fn().mockImplementation(() => {});
        tools.italicButton.setState = setStyleItalicMock;
        const setStyleBoldMock = jest.fn().mockImplementation(() => {});
        tools.boldButton.setState = setStyleBoldMock;

        tools.silentUpdate(style);

        expect(onStyleChange.mock.calls).toHaveLength(0);
        expect(setStyleItalicMock.mock.calls).toHaveLength(1);
        expect(setStyleItalicMock.mock.calls[0][0]).toBe(false);
        expect(setStyleBoldMock.mock.calls).toHaveLength(1);
        expect(setStyleBoldMock.mock.calls[0][0]).toBe(true);
    });

    test('underline true', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();
        onStyleChange.mockImplementation(() => {});
        const style: CSSObj = {
            "text-decoration": "underline"
        };
        const setStyleUnderlineMock = jest.fn().mockImplementation(() => {});
        tools.underlineButton.setState = setStyleUnderlineMock;

        tools.silentUpdate(style);

        expect(onStyleChange.mock.calls).toHaveLength(0);
        expect(setStyleUnderlineMock.mock.calls).toHaveLength(1);
        expect(setStyleUnderlineMock.mock.calls[0][0]).toBe(true);
    });

    test('strike-through', () => {
        const {tools, toolsContainer, onStyleChange} = buildTools();
        onStyleChange.mockImplementation(() => {});
        const style: CSSObj = {
            "text-decoration": "line-through"
        };
        const setStyleUnderlineMock = jest.fn().mockImplementation(() => {});
        tools.strikethroughButton.setState = setStyleUnderlineMock;

        tools.silentUpdate(style);

        expect(onStyleChange.mock.calls).toHaveLength(0);
        expect(setStyleUnderlineMock.mock.calls).toHaveLength(1);
        expect(setStyleUnderlineMock.mock.calls[0][0]).toBe(true);
    });
});
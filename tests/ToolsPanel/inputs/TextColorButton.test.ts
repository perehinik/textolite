import { TextColorButton } from "../../../src/ToolsPanel/Inputs/TextColorButton"; 

const styleChangedMock = jest.fn().mockImplementation(() => {});

const buildButton = () => {
    const button = new TextColorButton(styleChangedMock);
    styleChangedMock.mockReset();
    return button;
}

afterEach(() => {
    styleChangedMock.mockReset();
});

describe('Testing constructor', () => {
    test('constructor', () => {
        const button = buildButton();

        expect(button.Element.nodeName.toUpperCase()).toBe("DIV");
        expect(button.onStateChange).toEqual(styleChangedMock);
    });
});

describe('Testing buildColorStripe', () => {
    test('', () => {
        const button = buildButton();
        const result = button.buildColorStripe();
        expect(result.nodeName.toUpperCase()).toBe("DIV");
    });
});

describe('Testing click', () => {
    test('', () => {
        const button = buildButton();
        
        const event = new CustomEvent("click", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;
    
        button.button.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(1);
        expect(stopPropagationMock.mock.calls).toHaveLength(1);
        expect(styleChangedMock.mock.calls).toHaveLength(1);
        expect(styleChangedMock.mock.calls[0][0]).toEqual({"color": button.colorStripe.style.backgroundColor});
    });
});

describe('Testing colorChanged handler', () => {
    test('', () => {
        const button = buildButton();
    
        button.colorChanged("rgb(30, 31, 32)");

        expect(styleChangedMock.mock.calls).toHaveLength(1);
        expect(styleChangedMock.mock.calls[0][0]).toEqual({"color": "rgb(30, 31, 32)"});
    });
});
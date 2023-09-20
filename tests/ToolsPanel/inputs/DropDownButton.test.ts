import { DropDownButton } from "../../../src/ToolsPanel/Inputs/DropDownButton";


function buildDropDownButton() {
    const dropDownButton =  new DropDownButton();
    return dropDownButton;
}


describe('Testing constructor', () => {
    test('', () => {
        const dropDownButton = buildDropDownButton();

        expect(dropDownButton.Element.nodeName.toUpperCase()).toBe("DIV");
        expect(dropDownButton.button.nodeName.toUpperCase()).toBe("DIV");
    });
});

describe('Testing events', () => {
    test('Root element mouse down', () => {
        const dropDownButton = buildDropDownButton();

        const event = new CustomEvent("mousedown", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;
        
        dropDownButton.Element.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(1);
        expect(stopPropagationMock.mock.calls).toHaveLength(0);
    });

    test('Button click', () => {
        const dropDownButton = buildDropDownButton();

        const event = new CustomEvent("click", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;
        
        dropDownButton.button.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(1);
        expect(stopPropagationMock.mock.calls).toHaveLength(1);
    });
});

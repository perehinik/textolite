import { DropDownArrow } from "../../../src/ToolsPanel/Inputs/DropDownArrow";

const onStateChangeMock = jest.fn().mockImplementation(() => {});

function buildDropDownArrow() {
    const dropDownArrow =  new DropDownArrow(onStateChangeMock);
    onStateChangeMock.mockReset();
    return dropDownArrow;
}

afterEach(() => {
    onStateChangeMock.mockReset();
});

describe('Testing constructor', () => {
    test('', () => {
        const dropDownArrow = buildDropDownArrow();
        expect(dropDownArrow.state).toBe(false);
    });
});

describe('Testing appendDropDown', () => {
    test('', () => {
        const dropDownArrow = buildDropDownArrow();
        const dd = document.createElement("div");
        dropDownArrow.appendDropDown(dd);

        expect(dropDownArrow.dropDownContainer.firstChild).toEqual(dd);
    });
});

describe('Testing events', () => {
    test('arrow button mousedown', () => {
        const dropDownArrow = buildDropDownArrow();
        const event = new CustomEvent("mousedown", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;

        dropDownArrow.arrowButton.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(1);
        expect(stopPropagationMock.mock.calls).toHaveLength(0);
    });

    test('arrow button click', () => {
        const dropDownArrow = buildDropDownArrow();
        const event = new CustomEvent("click", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;
        
        expect(dropDownArrow.state).toBe(false);

        dropDownArrow.arrowButton.dispatchEvent(event);

        expect(dropDownArrow.state).toBe(true);
        expect(preventDefaultMock.mock.calls).toHaveLength(0);
        expect(stopPropagationMock.mock.calls).toHaveLength(1);
    });

    test('Root element mouse down, target not input', () => {
        const dropDownArrow = buildDropDownArrow();
        dropDownArrow.hideDropDownOnClick = false;

        const event = new CustomEvent("mousedown", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;
        
        dropDownArrow.Element.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(1);
        expect(stopPropagationMock.mock.calls).toHaveLength(1);
    });

    test('Root element mouse down, target not input, hide enabled', () => {
        const dropDownArrow = buildDropDownArrow();
        dropDownArrow.hideDropDownOnClick = true;

        const event = new CustomEvent("mousedown", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;
        
        dropDownArrow.Element.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(0);
        expect(stopPropagationMock.mock.calls).toHaveLength(0);
    });

    test('Root element -> mouse down, target is input', () => {
        const dropDownArrow = buildDropDownArrow();
        dropDownArrow.hideDropDownOnClick = false;
        const dd = document.createElement("input");
        dropDownArrow.appendDropDown(dd);

        const event = new CustomEvent("mousedown", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;

        dd.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(0);
        expect(stopPropagationMock.mock.calls).toHaveLength(1);
    });

    test('DropDown container -> click, target is input', () => {
        const dropDownArrow = buildDropDownArrow();
        dropDownArrow.hideDropDownOnClick = false;
        const dd = document.createElement("input");
        dropDownArrow.appendDropDown(dd);

        const event = new CustomEvent("click", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;

        dd.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(0);
        expect(stopPropagationMock.mock.calls).toHaveLength(1);
    });

    test('DropDown container -> click, target is NOT input', () => {
        const dropDownArrow = buildDropDownArrow();
        dropDownArrow.hideDropDownOnClick = false;
        const dd = document.createElement("div");
        dropDownArrow.appendDropDown(dd);

        const event = new CustomEvent("click", {bubbles: true});
        const preventDefaultMock = jest.fn().mockImplementation(() => {});
        const stopPropagationMock = jest.fn().mockImplementation(() => {});
        event.preventDefault = preventDefaultMock;
        event.stopPropagation = stopPropagationMock;

        dd.dispatchEvent(event);

        expect(preventDefaultMock.mock.calls).toHaveLength(1);
        expect(stopPropagationMock.mock.calls).toHaveLength(1);
    });

    test('Close DropDown after click on document', () => {
        const dropDownArrow = buildDropDownArrow();
        dropDownArrow.state = true;

        const event = new CustomEvent("click", {bubbles: true});
        expect(dropDownArrow.state).toBe(true);
        document.dispatchEvent(event);
        expect(dropDownArrow.state).toBe(false);
    });
});


describe('Testing adjustPosition', () => {
    test('dropdownLeft offset = 0', () => {
        const dropDownArrow = buildDropDownArrow();
        const documentRectMock = jest.fn();
        documentRectMock.mockReturnValue({
            left: 0,
            right: 300,
            width: 300,
            top: 0,
            bottom: 200,
            height: 200,
        });
        const anchorRectMock = jest.fn();
        anchorRectMock.mockReturnValue({
            left: 140,
            right: 160,
            width: 20,
            top: 14,
            bottom: 15,
            height: 1,
        });
        const ddRectMock = jest.fn();
        ddRectMock.mockReturnValue({
            left: 140,
            right: 240,
            width: 100,
            top: 15,
            bottom: 65,
            height: 50,
        });
        
        document.body.getBoundingClientRect = documentRectMock;
        dropDownArrow.dropDownAnchor.getBoundingClientRect = anchorRectMock;
        dropDownArrow.dropDownContainer.getBoundingClientRect = ddRectMock;

        dropDownArrow.adjustPosition();

        expect(dropDownArrow.dropDownContainer.style.left).toBe("-40px");
        expect(dropDownArrow.dropDownContainer.style.top).toBe("11px");
    });

    test('dropdownLeft = 0 offset -15', () => {
        const dropDownArrow = buildDropDownArrow();
        dropDownArrow.dropdownLeft = -15;
        const documentRectMock = jest.fn();
        documentRectMock.mockReturnValue({
            left: 0,
            right: 300,
            width: 300,
            top: 0,
            bottom: 200,
            height: 200,
        });
        const anchorRectMock = jest.fn();
        anchorRectMock.mockReturnValue({
            left: 140,
            right: 160,
            width: 20,
            top: 14,
            bottom: 15,
            height: 1,
        });
        const ddRectMock = jest.fn();
        ddRectMock.mockReturnValue({
            left: 140,
            right: 240,
            width: 100,
            top: 15,
            bottom: 65,
            height: 50,
        });
        
        document.body.getBoundingClientRect = documentRectMock;
        dropDownArrow.dropDownAnchor.getBoundingClientRect = anchorRectMock;
        dropDownArrow.dropDownContainer.getBoundingClientRect = ddRectMock;

        dropDownArrow.adjustPosition();

        expect(dropDownArrow.dropDownContainer.style.left).toBe("-55px");
        expect(dropDownArrow.dropDownContainer.style.top).toBe("11px");
    });

    test('dropdownLeft offset = 0, not anough space on left', () => {
        const dropDownArrow = buildDropDownArrow();
        const documentRectMock = jest.fn();
        documentRectMock.mockReturnValue({
            left: 0,
            right: 300,
            width: 300,
            top: 0,
            bottom: 200,
            height: 200,
        });
        const anchorRectMock = jest.fn();
        anchorRectMock.mockReturnValue({
            left: 20,
            right: 40,
            width: 20,
            top: 14,
            bottom: 15,
            height: 1,
        });
        const ddRectMock = jest.fn();
        ddRectMock.mockReturnValue({
            left: 40,
            right: 140,
            width: 100,
            top: 15,
            bottom: 65,
            height: 50,
        });
        
        document.body.getBoundingClientRect = documentRectMock;
        dropDownArrow.dropDownAnchor.getBoundingClientRect = anchorRectMock;
        dropDownArrow.dropDownContainer.getBoundingClientRect = ddRectMock;

        dropDownArrow.adjustPosition();

        expect(dropDownArrow.dropDownContainer.style.left).toBe("-25px");
        expect(dropDownArrow.dropDownContainer.style.top).toBe("11px");
    });

    test('dropdownLeft offset = 0, not anough space on right', () => {
        const dropDownArrow = buildDropDownArrow();
        const documentRectMock = jest.fn();
        documentRectMock.mockReturnValue({
            left: 0,
            right: 300,
            width: 300,
            top: 0,
            bottom: 200,
            height: 200,
        });
        const anchorRectMock = jest.fn();
        anchorRectMock.mockReturnValue({
            left: 260,
            right: 280,
            width: 20,
            top: 14,
            bottom: 15,
            height: 1,
        });
        const ddRectMock = jest.fn();
        ddRectMock.mockReturnValue({
            left: 280,
            right: 380,
            width: 100,
            top: 15,
            bottom: 65,
            height: 50,
        });
        
        document.body.getBoundingClientRect = documentRectMock;
        dropDownArrow.dropDownAnchor.getBoundingClientRect = anchorRectMock;
        dropDownArrow.dropDownContainer.getBoundingClientRect = ddRectMock;

        dropDownArrow.adjustPosition();

        expect(dropDownArrow.dropDownContainer.style.left).toBe("-65px");
        expect(dropDownArrow.dropDownContainer.style.top).toBe("11px");
    });
});

describe('Testing setState', () => {
    test('set true', () => {
        const dropDownArrow = buildDropDownArrow();
        const adjustPositionMock = jest.fn().mockImplementation();
        dropDownArrow.adjustPosition = adjustPositionMock;
        dropDownArrow.state = false;

        dropDownArrow.setState(true);

        expect(dropDownArrow.state).toBe(true);
        expect(adjustPositionMock.mock.calls).toHaveLength(1);
        expect(dropDownArrow.Element.style.backgroundColor).toEqual("rgba(200, 200, 200, 0.5)");
        expect(dropDownArrow.dropDownContainer.style.display).toEqual("block");
    });

    test('set false', () => {
        const dropDownArrow = buildDropDownArrow();
        const adjustPositionMock = jest.fn().mockImplementation();
        dropDownArrow.adjustPosition = adjustPositionMock;
        dropDownArrow.state = true;

        dropDownArrow.setState(false);

        expect(dropDownArrow.state).toBe(false);
        expect(adjustPositionMock.mock.calls).toHaveLength(0);
        expect(dropDownArrow.Element.style.backgroundColor).toEqual("transparent");
        expect(dropDownArrow.dropDownContainer.style.display).toEqual("none");
    });
});
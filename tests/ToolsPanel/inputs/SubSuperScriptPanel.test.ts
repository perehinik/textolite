import { SubSuperScriptPanel, scriptState } from "../../../src/ToolsPanel/Inputs/SubSuperScriptPanel";
import { subscriptIcon } from "../../../src/ToolsPanel/Icons";

const styleChangedMock = jest.fn().mockImplementation(() => {});

const buildSubSuperPanel = () => {
    const panel = new SubSuperScriptPanel(styleChangedMock);
    styleChangedMock.mockReset();
    return panel;
}

afterEach(() => {
    styleChangedMock.mockReset();
});

describe('Testing scriptState', () => {
    test('test keys', () => {
        expect(Object.keys(scriptState).includes("Pokemon")).toBe(false);
        expect(Object.keys(scriptState).includes("Subscript")).toBe(true);
        expect(Object.keys(scriptState).includes("None")).toBe(true);
        expect(Object.keys(scriptState).includes("Superscript")).toBe(true);
    });
});

describe('Testing constructor', () => {
    test('constructor', () => {
        const scriptPanel = buildSubSuperPanel();

        expect(scriptPanel.Element.nodeName).toBe("DIV");
        expect(scriptPanel.Element.childNodes.length).toBe(2);
        expect((scriptPanel.Element.childNodes[0].firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
        expect((scriptPanel.Element.childNodes[1].firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
        expect(scriptPanel.state).toBe(0);
        expect(scriptPanel.onStateChange).toEqual(styleChangedMock);
    });
});

describe('Testing createButton', () => {
    test('', () => {
        const scriptPanel = buildSubSuperPanel();
        const btn = scriptPanel.createButton(subscriptIcon, scriptState.Subscript);
        expect(btn.nodeName).toBe("BUTTON");
        expect((btn.firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
    });
});

describe('Testing onClickHandler', () => {
    test('superscript', () => {
        const scriptPanel = buildSubSuperPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        scriptPanel.setState = setStateMock;

        scriptPanel.onClickHandler(scriptState.Superscript);

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(scriptState.Superscript);
        expect(styleChangedMock.mock.calls).toHaveLength(1);

        expect(styleChangedMock.mock.calls[0][0]).toEqual({"vertical-align": "super"});
    });

    test('subscript', () => {
        const scriptPanel = buildSubSuperPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        scriptPanel.setState = setStateMock;

        scriptPanel.onClickHandler(scriptState.Subscript);

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(scriptState.Subscript);
        expect(styleChangedMock.mock.calls).toHaveLength(1);

        expect(styleChangedMock.mock.calls[0][0]).toEqual({"vertical-align": "sub"});
    });

    test('same button pressed twice', () => {
        const scriptPanel = buildSubSuperPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        scriptPanel.setState = setStateMock;
        scriptPanel.state = scriptState.Subscript

        scriptPanel.onClickHandler(scriptState.Subscript);

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(styleChangedMock.mock.calls).toHaveLength(1);

        expect(setStateMock.mock.calls[0][0]).toBe(scriptState.None);
        expect(styleChangedMock.mock.calls[0][0]).toEqual({"vertical-align": "baseline"});
    });
});

describe('Testing getStyleByState', () => {
    test('', () => {
        const scriptPanel = buildSubSuperPanel();

        expect(scriptPanel.getStyleByState(scriptState.None)).toEqual({"vertical-align": "baseline"});
        expect(scriptPanel.getStyleByState(563)).toEqual({"vertical-align": "baseline"});
        expect(scriptPanel.getStyleByState(scriptState.Subscript)).toEqual({"vertical-align": "sub"});
        expect(scriptPanel.getStyleByState(scriptState.Superscript)).toEqual({"vertical-align": "super"});
    });
});

describe('Testing getStateByStyle', () => {
    test('', () => {
        const scriptPanel = buildSubSuperPanel();

        expect(scriptPanel.getStateByStyle({"vertical-align": "baseline"})).toEqual(scriptState.None);
        expect(scriptPanel.getStateByStyle({"vertical-align": "sub"})).toEqual(scriptState.Subscript);
        expect(scriptPanel.getStateByStyle({"vertical-align": "super"})).toEqual(scriptState.Superscript);
    });
});

describe('Testing setStateByStyle', () => {
    test('none', () => {
        const scriptPanel = buildSubSuperPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        scriptPanel.setState = setStateMock;

        scriptPanel.setStateByStyle({"vertical-align": "baseline"})

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(scriptState.None);
    });

    test('subscript', () => {
        const scriptPanel = buildSubSuperPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        scriptPanel.setState = setStateMock;

        scriptPanel.setStateByStyle({"vertical-align": "sub"})

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(scriptState.Subscript);
    });

    test('superscript', () => {
        const scriptPanel = buildSubSuperPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        scriptPanel.setState = setStateMock;

        scriptPanel.setStateByStyle({"vertical-align": "super"})

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(scriptState.Superscript);
    });
});

describe('Testing setState', () => {
    test('first click', () => {
        const scriptPanel = buildSubSuperPanel();
        const setButtonStyleMock = jest.fn();
        scriptPanel.setButtonStyle = setButtonStyleMock;

        scriptPanel.setState(scriptState.Subscript);

        expect(setButtonStyleMock.mock.calls).toHaveLength(2);
        expect(setButtonStyleMock.mock.calls[0][0]).toEqual(scriptPanel.subscriptButton);
        expect(setButtonStyleMock.mock.calls[0][1]).toBe(true);
        expect(setButtonStyleMock.mock.calls[1][0]).toEqual(scriptPanel.superscriptButton);
        expect(setButtonStyleMock.mock.calls[1][1]).toBe(false);
    });
});

describe('Testing setButtonStyle', () => {
    test('state on', () => {
        const scriptPanel = buildSubSuperPanel();
        const btn: HTMLButtonElement = document.createElement("button");
        
        scriptPanel.setButtonStyle(btn, true);
        expect(btn.style.backgroundColor).toBe("rgba(200, 200, 200, 0.5)");
    });

    test('state off', () => {
        const scriptPanel = buildSubSuperPanel();
        const btn: HTMLButtonElement = document.createElement("button");
        
        scriptPanel.setButtonStyle(btn, false);
        expect(btn.style.backgroundColor).toBe("transparent");
    });
});

describe('Testing getValue', () => {
    test('', () => {
        const scriptPanel = buildSubSuperPanel();
        const getStyleByStateMock = jest.fn();
        scriptPanel.getStyleByState = getStyleByStateMock;

        getStyleByStateMock.mockReturnValue({"vertical-align": "sub"});
        expect(scriptPanel.getValue()).toEqual({"vertical-align": "sub"});

        getStyleByStateMock.mockReturnValue({"vertical-align": "super"});
        expect(scriptPanel.getValue()).toEqual({"vertical-align": "super"});
    });
});

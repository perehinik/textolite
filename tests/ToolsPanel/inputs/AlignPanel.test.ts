import { AlignPanel, alignState } from "../../../src/ToolsPanel/Inputs/AlignPanel";
import { alignLeftIcon, alignCenterIcon, alignRightIcon, alignJustifyIcon } from "../../../src/ToolsPanel/Icons";

const styleChangedMock = jest.fn().mockImplementation(() => {});

const buildAlignPanel = () => {
    return new AlignPanel(styleChangedMock);
}

afterEach(() => {
    styleChangedMock.mockReset();
});

describe('Testing alignState', () => {
    test('test keys', () => {
        expect(Object.keys(alignState).includes("Space")).toBe(false);
        expect(Object.keys(alignState).includes("None")).toBe(true);
        expect(Object.keys(alignState).includes("Left")).toBe(true);
        expect(Object.keys(alignState).includes("Center")).toBe(true);
        expect(Object.keys(alignState).includes("Right")).toBe(true);
        expect(Object.keys(alignState).includes("Justify")).toBe(true);
    });
});

describe('Testing constructor', () => {
    test('constructor', () => {
        const alPanel = buildAlignPanel();

        expect(alPanel.Element.nodeName).toBe("DIV");
        expect(alPanel.Element.childNodes.length).toBe(4);
        expect((alPanel.Element.childNodes[0].firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
        expect((alPanel.Element.childNodes[1].firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
        expect((alPanel.Element.childNodes[2].firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
        expect((alPanel.Element.childNodes[3].firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
        expect(alPanel.state).toBe(0);
        expect(alPanel.onStateChange).toEqual(styleChangedMock);
    });
});

describe('Testing createButton', () => {
    test('', () => {
        const alPanel = buildAlignPanel();
        const cb = jest.fn();
        const btn = alPanel.createButton(alignLeftIcon, alignState.Left);
        expect(btn.nodeName).toBe("BUTTON");
        expect((btn.firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
    });
});

describe('Testing onClickHandler', () => {
    test('left align', () => {
        const alPanel = buildAlignPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        alPanel.setState = setStateMock;

        alPanel.onClickHandler(alignState.Left);

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(alignState.Left);
        expect(styleChangedMock.mock.calls).toHaveLength(1);
        // because setState is mocked
        expect(styleChangedMock.mock.calls[0][0]).toEqual({"text-align": "left"});
    });

    test('same state', () => {
        const alPanel = buildAlignPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        alPanel.setState = setStateMock;
        alPanel.state = alignState.Right

        alPanel.onClickHandler(alignState.Right);

        expect(setStateMock.mock.calls).toHaveLength(0);
        expect(styleChangedMock.mock.calls).toHaveLength(0);
    });
});

describe('Testing getStyleByState', () => {
    test('', () => {
        const alPanel = buildAlignPanel();

        expect(alPanel.getStyleByState(alignState.Left)).toEqual({"text-align": "left"});
        expect(alPanel.getStyleByState(alignState.Center)).toEqual({"text-align": "center"});
        expect(alPanel.getStyleByState(alignState.Right)).toEqual({"text-align": "right"});
        expect(alPanel.getStyleByState(alignState.Justify)).toEqual({"text-align": "justify"});
        expect(alPanel.getStyleByState(alignState.None)).toEqual({});
        expect(alPanel.getStyleByState(6543)).toEqual({});
    });
});

describe('Testing getStateByStyle', () => {
    test('', () => {
        const alPanel = buildAlignPanel();

        expect(alPanel.getStateByStyle({"text-align": "left"})).toEqual(alignState.Left);
        expect(alPanel.getStateByStyle({"text-align": "center"})).toEqual(alignState.Center);
        expect(alPanel.getStateByStyle({"text-align": "right"})).toEqual(alignState.Right);
        expect(alPanel.getStateByStyle({"text-align": "justify"})).toEqual(alignState.Justify);
        expect(alPanel.getStateByStyle({"font-size": "12pt"})).toEqual(alignState.None);
        expect(alPanel.getStateByStyle({})).toEqual(alignState.None);
    });
});

describe('Testing setState', () => {
    test('set alignment left', () => {
        const alPanel = buildAlignPanel();
        const setButtonStyleMock = jest.fn();
        alPanel.setButtonStyle = setButtonStyleMock;

        alPanel.setState(alignState.Center);

        expect(setButtonStyleMock.mock.calls).toHaveLength(4);
        expect(setButtonStyleMock.mock.calls[0][0]).toEqual(alPanel.leftAlignButton);
        expect(setButtonStyleMock.mock.calls[0][1]).toBe(false);
        expect(setButtonStyleMock.mock.calls[1][0]).toEqual(alPanel.centerAlignButton);
        expect(setButtonStyleMock.mock.calls[1][1]).toBe(true);
        expect(setButtonStyleMock.mock.calls[2][0]).toEqual(alPanel.rightAlignButton);
        expect(setButtonStyleMock.mock.calls[2][1]).toBe(false);
        expect(setButtonStyleMock.mock.calls[3][0]).toEqual(alPanel.justifyAlignButton);
        expect(setButtonStyleMock.mock.calls[3][1]).toBe(false);
    });
});

describe('Testing setButtonStyle', () => {
    test('state on', () => {
        const alPanel = buildAlignPanel();
        const btn: HTMLButtonElement = document.createElement("button");
        
        alPanel.setButtonStyle(btn, true);
        expect(btn.style.backgroundColor).toBe("rgba(200, 200, 200, 0.5)");
    });

    test('state off', () => {
        const alPanel = buildAlignPanel();
        const btn: HTMLButtonElement = document.createElement("button");
        
        alPanel.setButtonStyle(btn, false);
        expect(btn.style.backgroundColor).toBe("transparent");
    });
});

describe('Testing getValue', () => {
    test('', () => {
        const alPanel = buildAlignPanel();
        const getStyleByStateMock = jest.fn();
        alPanel.getStyleByState = getStyleByStateMock;

        getStyleByStateMock.mockReturnValue({"text-align": "right"});
        expect(alPanel.getValue()).toEqual({"text-align": "right"});

        getStyleByStateMock.mockReturnValue({"text-align": "center"});
        expect(alPanel.getValue()).toEqual({"text-align": "center"});
    });
});
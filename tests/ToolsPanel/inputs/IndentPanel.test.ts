import { IndentPanel } from "../../../src/ToolsPanel/Inputs/IndentPanel";
import { subscriptIcon, superscriptIcon } from "../../../src/ToolsPanel/Icons";

const styleChangedMock = jest.fn().mockImplementation(() => {});

const buildIndentPanel = () => {
    const panel = new IndentPanel(styleChangedMock);
    styleChangedMock.mockReset();
    return panel;
}

afterEach(() => {
    styleChangedMock.mockReset();
});

describe('Testing constructor', () => {
    test('constructor', () => {
        const indentPanel = buildIndentPanel();

        expect(indentPanel.Element.nodeName).toBe("DIV");
        expect(indentPanel.Element.childNodes.length).toBe(4);
        expect(indentPanel.Element.childNodes[0].nodeName.toUpperCase()).toEqual("STYLE");
        expect(indentPanel.Element.childNodes[1].nodeName.toUpperCase()).toEqual("BUTTON");
        expect(indentPanel.Element.childNodes[2].nodeName.toUpperCase()).toEqual("DIV");
        expect(indentPanel.Element.childNodes[3].nodeName.toUpperCase()).toEqual("BUTTON");
        expect(indentPanel.state).toBe(1);
        expect(indentPanel.onStateChange).toEqual(styleChangedMock);
    });
});

describe('Testing createButton', () => {
    test('', () => {
        const indentPanel = buildIndentPanel();
        const btn = indentPanel.createButton(subscriptIcon, 1);
        expect(btn.nodeName).toBe("BUTTON");
        expect((btn.firstChild as HTMLElement).nodeName.toUpperCase()).toEqual("SVG");
    });
});

describe('Testing onClickHandler', () => {
    test('increment', () => {
        const indentPanel = buildIndentPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        indentPanel.setState = setStateMock;

        indentPanel.state = 1;
        indentPanel.onClickHandler(1);

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(2);
        expect(styleChangedMock.mock.calls).toHaveLength(1);

        expect(styleChangedMock.mock.calls[0][0]).toEqual({'text-indent': "20pt"});
    });

    test('decrement', () => {
        const indentPanel = buildIndentPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        indentPanel.setState = setStateMock;

        indentPanel.state = 1;
        indentPanel.onClickHandler(-1);

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(0);
        expect(styleChangedMock.mock.calls).toHaveLength(1);

        expect(styleChangedMock.mock.calls[0][0]).toEqual({'text-indent': "0pt"});
    });
});

describe('Testing setStateByStyle', () => {
    test('20pt -> 2', () => {
        const indentPanel = buildIndentPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        indentPanel.setState = setStateMock;

        indentPanel.setStateByStyle({'text-indent': "20pt"})

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(2);
    });

    test('13pt -> 1', () => {
        const indentPanel = buildIndentPanel();
        const setStateMock = jest.fn().mockImplementation(() => {});
        indentPanel.setState = setStateMock;

        indentPanel.setStateByStyle({'text-indent': "13pt"})

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(1);
    });

    test('integration', () => {
        const indentPanel = buildIndentPanel();

        indentPanel.setStateByStyle({'text-indent': "23pt"})

        expect(indentPanel.state).toBe(2);
        expect(indentPanel.indentState.textContent).toBe("2");
        expect(styleChangedMock.mock.calls).toHaveLength(0);
    });
});

describe('Testing setState', () => {
    test('1', () => {
        const indentPanel = buildIndentPanel();

        indentPanel.state = 2;
        indentPanel.setState(1);

        expect(indentPanel.state).toBe(1);
        expect(indentPanel.indentState.textContent).toBe("1");
    });

    test('-1', () => {
        const indentPanel = buildIndentPanel();

        indentPanel.state = 2;
        indentPanel.setState(-1);

        expect(indentPanel.state).toBe(0);
        expect(indentPanel.indentState.textContent).toBe("0");
    });

    test('100', () => {
        const indentPanel = buildIndentPanel();

        indentPanel.state = 2;
        indentPanel.setState(100);

        expect(indentPanel.state).toBe(30);
        expect(indentPanel.indentState.textContent).toBe("30");
    });
});

describe('Testing getValue', () => {
    test('', () => {
        const indentPanel = buildIndentPanel();

        indentPanel.state = 1;
        expect(indentPanel.getValue()).toEqual({'text-indent': "10pt"});

        indentPanel.state = 12;
        expect(indentPanel.getValue()).toEqual({'text-indent': "120pt"});

        indentPanel.state = 0;
        expect(indentPanel.getValue()).toEqual({'text-indent': "0pt"});
    });
});

describe('Testing button click integration', () => {
    test('increment', () => {
        const indentPanel = buildIndentPanel();
        const event = new CustomEvent("click", {bubbles: true})

        indentPanel.state = 1;
        indentPanel.increaseIndentButton.dispatchEvent(event);

        expect(indentPanel.state).toBe(2);
        expect(indentPanel.indentState.textContent).toBe("2");
        expect(styleChangedMock.mock.calls).toHaveLength(1);
        expect(styleChangedMock.mock.calls[0][0]).toEqual({'text-indent': "20pt"});
    });

    test('decrement', () => {
        const indentPanel = buildIndentPanel();
        const event = new CustomEvent("click", {bubbles: true})

        indentPanel.state = 1;
        indentPanel.decreaseIndentButton.dispatchEvent(event);

        expect(indentPanel.state).toBe(0);
        expect(indentPanel.indentState.textContent).toBe("0");
        expect(styleChangedMock.mock.calls).toHaveLength(1);
        expect(styleChangedMock.mock.calls[0][0]).toEqual({'text-indent': "0pt"});
    });
});
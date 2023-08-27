import { Button } from "../../../src/ToolsPanel/Inputs/Button";
import { bold } from "../../../src/ToolsPanel/icon/icons";

const styleChangedMock = jest.fn().mockImplementation(() => {});

const buildButton = () => {
    return new Button(bold, {"state": "ON"}, {"state": "OFF"}, styleChangedMock);
}

afterEach(() => {
    styleChangedMock.mockReset();
});

describe('Testing constructor', () => {
    test('constructor', () => {
        const button = buildButton();

        expect(button.btEl.nodeName).toBe("BUTTON");
        expect(button.state).toBe(false);
        expect(button.onStateChange).toEqual(styleChangedMock);
    });
});


describe('Testing onClickHandler', () => {
    test('state is off', () => {
        const button = buildButton();
        const setStateMock = jest.fn().mockImplementation(() => {});
        button.setState = setStateMock;

        button.onClickHandler();

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(true);
        expect(styleChangedMock.mock.calls).toHaveLength(1);
        // because setState is mocked
        expect(styleChangedMock.mock.calls[0][0]).toEqual({"state": "OFF"});
    });

    test('state is on', () => {
        const button = buildButton();
        button.state = true;
        const setStateMock = jest.fn().mockImplementation(() => {});
        button.setState = setStateMock;

        button.onClickHandler();

        expect(setStateMock.mock.calls).toHaveLength(1);
        expect(setStateMock.mock.calls[0][0]).toBe(false);
        expect(styleChangedMock.mock.calls).toHaveLength(1);
        // because setState is mocked
        expect(styleChangedMock.mock.calls[0][0]).toEqual({"state": "ON"});
    });
});

describe('Testing onClickHandler integration', () => {
    test('state is off', () => {
        const button = buildButton();

        button.onClickHandler();

        expect(styleChangedMock.mock.calls).toHaveLength(1);
        expect(styleChangedMock.mock.calls[0][0]).toEqual({"state": "ON"});
    });

    test('state is on', () => {
        const button = buildButton();
        button.state = true;

        button.onClickHandler();

        expect(styleChangedMock.mock.calls).toHaveLength(1);
        expect(styleChangedMock.mock.calls[0][0]).toEqual({"state": "OFF"});
    });
});

describe('Testing setState', () => {
    test('set true', () => {
        const button = buildButton();

        button.setState(true);

        expect(button.state).toBe(true);
        expect(button.btEl.style.backgroundColor).toEqual("rgba(200, 200, 200, 0.5)");
    });

    test('set false', () => {
        const button = buildButton();
        button.state = true;

        button.setState(false);

        expect(button.state).toBe(false);
        expect(button.btEl.style.backgroundColor).toEqual("transparent");
    });
});

describe('Testing getValue', () => {
    test('', () => {
        const button = buildButton();

        button.state = true;
        expect(button.getValue()).toEqual({"state": "ON"});

        button.state = false;
        expect(button.getValue()).toEqual({"state": "OFF"});
    });
});
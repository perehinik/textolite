import { BrightnessSlider } from "../../../src/ToolsPanel/Inputs/BrightnessSlider";

const onStateChangeMock = jest.fn().mockImplementation(() => {});

afterEach(() => {
    onStateChangeMock.mockReset();
});


describe('Testing constructor', () => {
    test('', () => {
        const slider = new BrightnessSlider(onStateChangeMock);

        expect(slider.Element.nodeName.toUpperCase()).toBe("DIV");
        expect(slider.Element.childNodes.length).toBe(3);
        expect(slider.Element.childNodes[0].nodeName.toUpperCase()).toBe("DIV");
        expect(slider.Element.childNodes[1].nodeName.toUpperCase()).toBe("INPUT");
        expect(slider.Element.childNodes[2].nodeName.toUpperCase()).toBe("DIV");
    });
});

describe('Testing setValue', () => {
    test('value is in range', () => {
        const slider = new BrightnessSlider(onStateChangeMock);
        slider.setValue(34);
        expect(slider.slider.value).toBe(34);
        expect(onStateChangeMock.mock.calls).toHaveLength(1);
        expect(onStateChangeMock.mock.calls[0][0]).toBe(34);
    });

    test('edge case1', () => {
        const slider = new BrightnessSlider(onStateChangeMock);
        slider.setValue(-100);
        expect(slider.slider.value).toBe(-100);
        expect(onStateChangeMock.mock.calls).toHaveLength(1);
        expect(onStateChangeMock.mock.calls[0][0]).toBe(-100);
    });

    test('edge case 2', () => {
        const slider = new BrightnessSlider(onStateChangeMock);
        slider.setValue(100);
        expect(slider.slider.value).toBe(100);
        expect(onStateChangeMock.mock.calls).toHaveLength(1);
        expect(onStateChangeMock.mock.calls[0][0]).toBe(100);
    });
});

describe('Testing getValue', () => {
    test('test 1', () => {
        const slider = new BrightnessSlider(onStateChangeMock);

        expect(slider.getValue()).toBe(0);
    });

    test('test 2', () => {
        const slider = new BrightnessSlider(onStateChangeMock);

        slider.setValue(24)
        expect(slider.getValue()).toBe(24);
    });
});

describe('Testing sliderValueChanged handler', () => {
    test('', () => {
        const slider = new BrightnessSlider(onStateChangeMock);

        slider.sliderValueChanged(65);

        expect(slider.valueBox.textContent).toBe("65");
        expect(onStateChangeMock.mock.calls).toHaveLength(1);
        expect(onStateChangeMock.mock.calls[0][0]).toBe(65);
    });
});

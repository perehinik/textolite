import { RangeSlider } from "../../../src/ToolsPanel/Inputs/Slider";

const onStateChangeMock = jest.fn().mockImplementation(() => {});

afterEach(() => {
    onStateChangeMock.mockReset();
});


describe('Testing constructor', () => {
    test('', () => {
        const slider = new RangeSlider(0, 100, 1, 3, onStateChangeMock);

        expect(slider.Element.nodeName.toUpperCase()).toBe("INPUT");
        expect(slider.Element.type.toUpperCase()).toBe("RANGE");

        expect(parseInt(slider.Element.value)).toBe(3);
        expect(parseInt(slider.Element.min)).toBe(0);
        expect(parseInt(slider.Element.max)).toBe(100);
        expect(parseInt(slider.Element.step)).toBe(1);
    });
});

describe('Testing setValue', () => {
    test('value is in range', () => {
        const slider = new RangeSlider(0, 100, 1, 3, onStateChangeMock);

        const result = slider.setValue(34);

        expect(result).toBeTruthy();
        expect(parseInt(slider.Element.value)).toBe(34);
        expect(slider.value).toBe(34);
    });

    test('edge case', () => {
        const slider = new RangeSlider(0, 100, 1, 3, onStateChangeMock);

        const result = slider.setValue(100);

        expect(result).toBeTruthy();
        expect(parseInt(slider.Element.value)).toBe(100);
        expect(slider.value).toBe(100);
    });

    test('out of range', () => {
        const slider = new RangeSlider(0, 100, 1, 8, onStateChangeMock);

        const result = slider.setValue(101);

        expect(result).toBeFalsy();
        expect(parseInt(slider.Element.value)).toBe(8);
        expect(slider.value).toBe(8);
    });
});

describe('Testing valueChange', () => {
    test('', () => {
        const slider = new RangeSlider(-49, 49, 1, -8, onStateChangeMock);

        slider.Element.value = '45';
        const event = new CustomEvent("input", {bubbles: true});
        slider.Element.dispatchEvent(event);

        expect(onStateChangeMock.mock.calls).toHaveLength(1);
        expect(onStateChangeMock.mock.calls[0][0]).toBe(45);
        expect(parseInt(slider.Element.value)).toBe(45);
        expect(slider.value).toBe(45);
    });
});

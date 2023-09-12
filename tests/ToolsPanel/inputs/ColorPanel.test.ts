import { ColorPanel } from "../../../src/ToolsPanel/Inputs/ColorPanel";
import { Color } from "../../../src/ToolsPanel/Inputs/ColorToolset";
import * as colorToolsetModule from "../../../src/ToolsPanel/Inputs/ColorToolset";

const colorChangedMock = jest.fn().mockImplementation(() => {});
const colorToStringMock = jest.spyOn(colorToolsetModule, 'colorToString' as any);

function buildColorPanel() {
    const colorPanel =  new ColorPanel(colorChangedMock);
    colorToStringMock.mockReset();
    return colorPanel;
}

afterEach(() => {
    colorChangedMock.mockReset();
    colorToStringMock.mockReset();
});

describe('Testing constructor', () => {
    test('constructor', () => {
        const handler = () => {};
        const colorPanel = new ColorPanel(handler);

        expect(colorPanel.onStateChange).toEqual(handler);
        expect(colorPanel.colors.length).toBeGreaterThan(0);
        expect(colorPanel.colors.length).toEqual(colorPanel.buttons.length);
    });

    test('fixture constructor', () => {
        const colorPanel = buildColorPanel();

        expect(colorPanel.onStateChange).toEqual(colorChangedMock);
        expect(colorPanel.colors.length).toBeGreaterThan(0);
        expect(colorPanel.colors.length).toEqual(colorPanel.buttons.length);
    });
});

describe('Testing buildElement', () => {
    test('', () => {
        const colorPanel = buildColorPanel();
        const element = colorPanel.buildElement();
        expect(element.nodeName.toUpperCase()).toEqual("DIV");
    });
});

describe('Testing buildButton', () => {
    test('test onClick handler', () => {
        const colorPanel = buildColorPanel();
        const buttonClick = jest.fn().mockImplementation(() => {});
        const color: Color = {R:100, G:32, B:27};
        const colorId = 45;
        const button = colorPanel.buildButton(colorId, color, buttonClick);
        const event = new CustomEvent("click");
        button.dispatchEvent(event);

        expect(button.nodeName.toUpperCase()).toEqual("DIV");
        expect(buttonClick.mock.calls).toHaveLength(1);
        expect(buttonClick.mock.calls[0][0]).toBe(colorId);
        expect(buttonClick.mock.calls[0][1]).toEqual(color);
    });
});

describe('Testing buildColorBox', () => {
    test('', () => {
        const colorPanel = buildColorPanel();
        const colorBox = colorPanel.buildColorBox();
        expect(colorBox.nodeName.toUpperCase()).toEqual("DIV");
        expect(colorBox.childNodes).toHaveLength(0);
    });
});

describe('Testing buildUsedColors', () => {
    test('', () => {
        const colorPanel = buildColorPanel();
        const usedColors = colorPanel.buildUsedColors();
        expect(usedColors.nodeName.toUpperCase()).toEqual("DIV");
        expect(usedColors.childNodes).toHaveLength(13);
        const color1Button = usedColors.childNodes[0] as HTMLElement;
        const color2Button = usedColors.childNodes[1] as HTMLElement;
        const color3Button = usedColors.childNodes[2] as HTMLElement;
        expect(color1Button.style?.backgroundColor.replace(" ", "").replace(" ", "").replace(" ", "")).toEqual("rgb(0,0,0)");
        expect(color2Button.style?.backgroundColor.replace(" ", "").replace(" ", "").replace(" ", "")).toEqual("rgb(255,255,255)");
        expect(color3Button.style?.backgroundColor.replace(" ", "").replace(" ", "").replace(" ", "")).toEqual("rgba(255,255,255,0)");
    });
});

describe('Testing buildPalette', () => {
    test('', () => {
        const colorPanel = buildColorPanel();
        const palette = colorPanel.buildPalette();
        expect(palette.nodeName.toUpperCase()).toEqual("DIV");
        expect(palette.childNodes).toHaveLength(13);
        
        for (let i = 1; i<palette.childNodes.length; i++) {
            const color1 = (palette.childNodes[i] as HTMLElement).style.backgroundColor;
            const color2 = (palette.childNodes[i-1] as HTMLElement).style.backgroundColor;
            expect(color1 === color2).toBe(false);
        }
    });
});

describe('Testing onClickHandler', () => {
    test('', () => {
        const colorPanel = buildColorPanel();
        colorPanel.currentColorId = 1;
        const setButtonStateMock = jest.fn().mockImplementation(() => {});
        colorPanel.setButtonState = setButtonStateMock;
        const sliderSetValue = jest.fn().mockImplementation(() => {});
        colorPanel.slider.setValue = sliderSetValue;
        colorToStringMock.mockImplementation(() => {});
        colorToStringMock.mockReturnValue("rgm(1, 2, 3)");
        
        colorPanel.onClickHandler(2, {R:100, G:32, B:27});

        expect(setButtonStateMock.mock.calls).toHaveLength(2);
        expect(setButtonStateMock.mock.calls[0]).toEqual([1, false]);
        expect(setButtonStateMock.mock.calls[1]).toEqual([2, true]);
        expect(colorToStringMock.mock.calls).toHaveLength(1);
        expect(sliderSetValue.mock.calls).toHaveLength(1);
        expect(sliderSetValue.mock.calls[0][0]).toBe(0);
    });
});

describe('Testing setButtonState', () => {
    test('set on', () => {
        const colorPanel = buildColorPanel();
        const button = document.createElement("div");
        colorPanel.buttons = [button];

        colorPanel.setButtonState(0, true);

        expect(button.style.border).toBe("2px solid black");
    });

    test('set off', () => {
        const colorPanel = buildColorPanel();
        const button = document.createElement("div");
        colorPanel.buttons = [button];

        colorPanel.setButtonState(0, false);

        expect(button.style.border).toBe("1px solid gray");
    });
});

describe('Testing colorBoxClickHandler', () => {
    test('slider positive', () => {
        const colorPanel = buildColorPanel();
        colorPanel.currentColorId = 2;
        colorPanel.usedColorId = 5;
        const sliderGetValue = jest.fn().mockImplementation(() => {});
        colorPanel.slider.getValue = sliderGetValue;
        sliderGetValue.mockReturnValue(50);

        colorPanel.colorBoxClickHandler();
        const color = colorPanel.colors[2];
        const usedColor = colorPanel.usedColors[5];
        
        expect(color.R).toBe(usedColor.R);
        expect(color.G).toBe(usedColor.G);
        expect(color.B).toBe(usedColor.B);
        expect(usedColor.brightness).toBe(0.5);
    });

    test('slider negative', () => {
        const colorPanel = buildColorPanel();
        colorPanel.currentColorId = 3;
        colorPanel.usedColorId = 5;
        const sliderGetValue = jest.fn().mockImplementation(() => {});
        colorPanel.slider.getValue = sliderGetValue;
        sliderGetValue.mockReturnValue(-30);

        colorPanel.colorBoxClickHandler();
        const color = colorPanel.colors[3];
        const usedColor = colorPanel.usedColors[5];
        
        expect(color.R).toBe(usedColor.R);
        expect(color.G).toBe(usedColor.G);
        expect(color.B).toBe(usedColor.B);
        expect(usedColor.brightness).toBe(-0.3);
    });
});

describe('Testing onUsedClickHandler', () => {
    test('negative id', () => {
        const colorPanel = buildColorPanel();
        const usedColor = {...colorPanel.colors[3]}
        const color = {...colorPanel.colors[3]}
        usedColor.brightness = -0.34;

        const onClickHandlerMock = jest.fn().mockImplementation(() => {});
        colorPanel.onClickHandler = onClickHandlerMock;
        const sliderSetValueMock = jest.fn().mockImplementation(() => {});
        colorPanel.slider.setValue = sliderSetValueMock;

        colorPanel.onUsedClickHandler(-3, usedColor);

        expect(onClickHandlerMock.mock.calls).toHaveLength(1);
        expect(onClickHandlerMock.mock.calls[0][0]).toBe(3);
        expect(onClickHandlerMock.mock.calls[0][1]).toEqual(color);

        expect(sliderSetValueMock.mock.calls).toHaveLength(1);
        expect(sliderSetValueMock.mock.calls[0][0]).toBe(-34);
    });

    test('positive id', () => {
        const colorPanel = buildColorPanel();
        const usedColor = {...colorPanel.colors[5]}
        usedColor.brightness = 0.45;
        const color = {...colorPanel.colors[5]}
        colorPanel.usedColors[4] = usedColor;

        const onClickHandlerMock = jest.fn().mockImplementation(() => {});
        colorPanel.onClickHandler = onClickHandlerMock;
        const sliderSetValueMock = jest.fn().mockImplementation(() => {});
        colorPanel.slider.setValue = sliderSetValueMock;

        colorPanel.onUsedClickHandler(4, {R:0, G:0, B:0});

        expect(onClickHandlerMock.mock.calls).toHaveLength(1);
        expect(onClickHandlerMock.mock.calls[0][0]).toBe(5);
        expect(onClickHandlerMock.mock.calls[0][1]).toEqual(color);

        expect(sliderSetValueMock.mock.calls).toHaveLength(1);
        expect(sliderSetValueMock.mock.calls[0][0]).toBe(45);
    });

    test('brightness is undefined', () => {
        const colorPanel = buildColorPanel();
        const usedColor = {...colorPanel.colors[5]}
        usedColor.brightness = undefined;
        const color = {...colorPanel.colors[5]}
        colorPanel.usedColors[4] = usedColor;

        const onClickHandlerMock = jest.fn().mockImplementation(() => {});
        colorPanel.onClickHandler = onClickHandlerMock;
        const sliderSetValueMock = jest.fn().mockImplementation(() => {});
        colorPanel.slider.setValue = sliderSetValueMock;

        colorPanel.onUsedClickHandler(4, {R:0, G:0, B:0});

        expect(onClickHandlerMock.mock.calls).toHaveLength(1);
        expect(onClickHandlerMock.mock.calls[0][0]).toBe(5);
        expect(onClickHandlerMock.mock.calls[0][1]).toEqual(color);

        expect(sliderSetValueMock.mock.calls).toHaveLength(1);
        expect(sliderSetValueMock.mock.calls[0][0]).toBe(0);
    });
});

describe('Testing getColor', () => {
    test('', () => {
        const colorPanel = buildColorPanel();
        const colorId = 1;
        colorPanel.currentColorId = colorId;

        const result = colorPanel.getColor();
        expect(result).toEqual(colorPanel.colors[colorId]);
    });
});

describe('Testing getColorStr', () => {
    test('', () => {
        const colorPanel = buildColorPanel();
        colorPanel.currentColorId = 7;
        colorToStringMock.mockImplementation(() => {});
        colorToStringMock.mockReturnValue("rgm(1, 2, 3)");

        const result = colorPanel.getColorStr();

        expect(colorToStringMock.mock.calls).toHaveLength(1);
        expect(colorToStringMock.mock.calls[0][0]).toEqual(colorPanel.colors[7]);
        expect(result).toEqual("rgm(1, 2, 3)");
    });
});


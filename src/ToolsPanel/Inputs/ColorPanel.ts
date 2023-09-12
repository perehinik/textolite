/**
 * @module ColorPanel - Module contains implementation of color panel and toolset for working with colors.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { BrightnessSlider } from "./BrightnessSlider";
import { Color, getColors, colorToString } from "./ColorToolset";

/**
 * Class implements color panel.
 */
export class ColorPanel {
    currentColorId: number = 0;
    transparency: number = 0;
    Element: HTMLDivElement;
    buttons: HTMLDivElement[] = [];
    usedColorsButtons: HTMLDivElement[] = [];
    onStateChange: (colorStr: string) => void;
    colors: Color[];
    usedColors: Color[] = [];
    usedColorId: number = 0;
    colorBox: HTMLDivElement;
    slider: BrightnessSlider;

    /**
     * ColorPanel constructor.
     *
     * @param onStateChange - Callback for alignment update.
     */
    constructor(onStateChange: (colorStr: string) => void) {
        this.onStateChange = onStateChange;
        this.Element = this.buildElement();
        this.colors = getColors();

        this.onClickHandler = this.onClickHandler.bind(this);
        this.onUsedClickHandler = this.onUsedClickHandler.bind(this);
        this.sliderValueChanged = this.sliderValueChanged.bind(this);
        this.colorBoxClickHandler = this.colorBoxClickHandler.bind(this);

        const usedColors = this.buildUsedColors();
        const palette = this.buildPalette();
        this.slider = new BrightnessSlider(this.sliderValueChanged);
        this.colorBox = this.buildColorBox();
        
        this.Element.appendChild(usedColors);
        this.Element.appendChild(palette);
        this.Element.appendChild(this.slider.Element);
        this.Element.appendChild(this.colorBox);
        
        this.connectEventHandlers();
        this.onClickHandler(this.colors.length - 1, this.colors[this.colors.length - 1]);
    }
    
    /**
     * Connect handlers to events.
     */
    connectEventHandlers(): void {
        this.colorBox.onmousedown = (event) => {event.preventDefault();}
        this.colorBox.addEventListener("click", this.colorBoxClickHandler, false);
    }
    
    /**
     * Build root color panel element.
     *
     * @returns - Container for color panel.
     */
    buildElement(): HTMLDivElement {
        const element = document.createElement("div");
        element.style.paddingTop = "4px";
        element.style.width = "220px";
        element.style.height = "90px";
        element.style.backgroundColor = "rgb(240, 240, 240)";
        element.style.display = "flex";
        element.style.flexDirection = "column";
        element.style.alignItems = "center";
        return element;
    }

    /**
     * Build color button.
     *
     * @param colorId - Id which will be one of parameters in the callback when button is pressed.
     * @param color: - Background color of button, also is one of parameters in callback.
     * @param onClick - Callback for button click.
     * @returns - Single button element.
     */
    buildButton(colorId: number, color: Color, onClick: (colorId: number, color: Color) => void): HTMLDivElement {
        const button = document.createElement("div");
        button.style.display = "inline-block";
        button.style.margin = "2px 2px";
        button.style.width = "10px";
        button.style.height = "10px";
        button.style.border = "1px solid gray";
        button.style.borderRadius = "2px";
        button.style.padding = "none";
        button.style.backgroundColor = colorToString(color);

        button.onmousedown = (event) => {event.preventDefault();}
        button.addEventListener("click", () => {onClick(colorId, color)}, false);
        return button;
    }

    /**
     * Build color box showing color with adjusted brightness.
     *
     * @returns - Color box.
     */
    buildColorBox(): HTMLDivElement {
        const div = document.createElement("div");
        div.style.width = '90%';
        div.style.height = '13px';
        div.style.margin = '2px 2px';
        div.style.border = '1px solid grey';
        div.style.borderRadius = "2px";
        return div;
    }

    /**
     * Builds panel where custom colors could be inserted by pressing on bolor box.
     *
     * @returns - Panel for custom colors.
     */
    buildUsedColors(): HTMLDivElement {
        const container: HTMLDivElement = document.createElement("div");
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.width = "100%";
        container.style.margin = "0 auto";
        const grayColorId = this.colors.length - 1;
        const blackColor: Color = { ...this.colors[grayColorId], opacity: 1, brightness: -1};
        const whiteColor: Color = { ...this.colors[grayColorId], opacity: 1, brightness: 1};
        const transparentColor: Color = { ...this.colors[grayColorId], opacity: 0, brightness: 1};
        
        container.appendChild(this.buildButton(-grayColorId, blackColor, this.onUsedClickHandler));
        container.appendChild(this.buildButton(-grayColorId, whiteColor, this.onUsedClickHandler));

        const splitter = this.buildButton(0, transparentColor, () => {});
        splitter.style.borderColor = splitter.style.backgroundColor;
        container.appendChild(splitter);
        
        for(let i = 0; i < 10; i++) {
            const color = {...whiteColor};
            const button = this.buildButton(i, color, this.onUsedClickHandler);
            container.appendChild(button);
            this.usedColorsButtons.push(button);
            this.usedColors.push(color);     
        }
        return container;
    }

    /**
     * Builds panel with all main colors.
     *
     * @returns - Panel with main colors.
     */
    buildPalette(): HTMLDivElement {
        const container: HTMLDivElement = document.createElement("div");
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.width = "100%";
        container.style.margin = "0 auto";
        
        for(let i = 0; i < this.colors.length; i++) {
            const button = this.buildButton(i, this.colors[i], this.onClickHandler);
            container.appendChild(button);
            this.buttons.push(button);
        }
        return container;
    }

    /**
     * Handler for color button click.
     *
     * @param colorId - Id of standart or custom color.
     * @param color - Color object.
     */
    onClickHandler(colorId: number, color: Color): void {
        if (this.currentColorId !== colorId) {
            this.setButtonState(this.currentColorId, false);
            this.setButtonState(colorId, true);
            this.currentColorId = colorId;
        }
        const colorStr: string = colorToString(color);
        this.colorBox.style.backgroundColor = colorStr;
        this.slider.setValue(0);
        this.onStateChange(colorStr);
    }

    /**
     * Updats style for color button when it's clicked.
     *
     * @param buttonId - Id of button.
     * @param state - New button state.
     */
    setButtonState(buttonId: number, state: boolean): void {
        const button = this.buttons[buttonId]
        if (state) {
            button.style.border = "2px solid black";
            button.style.margin = "1px 1px";
        } else {
            button.style.border = "1px solid gray";
            button.style.margin = "2px 2px";
        }
    }

    /**
     * Updats colorbox when brightness is changed.
     *
     * @param newValue - New slider value.
     */
    sliderValueChanged(newValue: number): void {
        const currentColor = {...this.colors[this.currentColorId]};
        currentColor.brightness = newValue / 100;
        const colorStr: string = colorToString(currentColor);
        this.colorBox.style.backgroundColor = colorStr;
        this.onStateChange(colorStr);
    }

    /**
     * When color box clicked - copy color from colorbox to custom color panel.
     */
    colorBoxClickHandler(): void {
        const color = {...this.colors[this.currentColorId]};
        color.brightness = this.slider.getValue() / 100;
        this.usedColors[this.usedColorId] = color;
        this.usedColorsButtons[this.usedColorId].style.backgroundColor = colorToString(color);
        this.usedColorId = (this.usedColorId + 1) % 10;
    }

    /**
     * Custom color clicked so it moves it to colorbox and choses corresponding main color and brightness.
     *
     * @param colorId - Custom color Id.
     * @param color - Actually in this case it receives always white. So it's not used.
     */
    onUsedClickHandler(colorId: number, color: Color): void {
        let standartColorId = 0;
        if (colorId < 0) {
            standartColorId = Math.abs(colorId);
        } else {
            color = this.usedColors[colorId];
            for (let i = 0; i < this.colors.length; i++) {
                const {R, G, B} = this.colors[i];
                if (R === color.R && G === color.G && B === color.B) {
                    standartColorId = i;
                    break;
                }
            }
        }
        this.onClickHandler(standartColorId, this.colors[standartColorId]);
        this.slider.setValue(color.brightness ? Math.round(color.brightness * 100) : 0);
    }
    
    /**
     * Returns object representing current color.
     *
     * @returns - Color object.
     */
    getColor(): Color {
        return this.colors[this.currentColorId];
    }

    /**
     * Returns string representing current color.
     *
     * @returns - Color string.
     */
    getColorStr(): string {
        return colorToString(this.colors[this.currentColorId]);
    }
}

/**
 * @module ColorPanel - Module contains implementation of color panel and toolset for working with colors.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { BrightnessSlider } from "./BrightnessSlider";

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
        this.colorBox.addEventListener("click", this.colorBoxClickHandler);
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

        button.onmousedown = (event) => {event.preventDefault();};
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
            this.setButtonState(this.buttons[this.currentColorId], false);
            this.setButtonState(this.buttons[colorId], true);
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
     * @param colorId - Id of standart or custom color.
     * @param color - Color object.
     */
    setButtonState(button: HTMLDivElement, state: boolean): void {
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
        const currentColor = {...standartColors[this.currentColorId]};
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

/**
 * Color type definition.
 * 
 * @param R - Red 0-255.
 * @param G - Green 0-255.
 * @param B - Blue 0-255.
 * @param opacity - 0-1, 0-transparent.
 * @param brightness - -1-1. -1=black, 1=white.
 */ 
export type Color = {
    R: number,
    G: number,
    B: number,
    opacity?: number,
    brightness?: number
};

/**
 * Array of main colors supported by color panel.
 */ 
export const standartColors: Color[] = getColors();

/**
 * Build array with standart colors.
 * 
 * @returns Array with standart colors.
 */ 
function getColors(): Color[] {
    const gradient: number[] = [0, 0, 0, 0, 0, 128, 255, 255, 255, 255, 255, 128];
    const colors: Color[] = [];
    for(let i = 0; i < gradient.length; i++) {
        colors.push({
            R: gradient[i],
            G: gradient[(i + 4) % gradient.length],
            B: gradient[(i + 8) % gradient.length],
            opacity: 1,
            brightness: 0
        });
    }
    colors.push({ R: 128, G: 128, B: 128, opacity: 1 });
    return colors;
}

/**
 * Convert color object to color string.
 * 
 * @param color - Color object.
 * @returns - Result color string.
 */ 
export function colorToString(color: Color): string {
    let {R, G, B} = color;
    if (color.brightness && color.brightness > 0) {
        R += Math.round((255 - R) * color.brightness);
        G += Math.round((255 - G) * color.brightness);
        B += Math.round((255 - B) * color.brightness);
    } else if (color.brightness && color.brightness < 0) {
        R += Math.round(R * color.brightness);
        G += Math.round(G * color.brightness);
        B += Math.round(B * color.brightness);
    }
    // Limit value to 0-255
    R = Math.min(Math.max(R, 0),255);
    G = Math.min(Math.max(G, 0),255);
    B = Math.min(Math.max(B, 0),255);

    return color.opacity != null ? `rgba(${R}, ${G}, ${B}, ${color.opacity})` : `rgb(${R}, ${G}, ${B})`;
}

/**
 * Convert color string to closest color object.
 * 
 * @param color - Color string.
 * @returns - Closest standart color representing specified string.
 */ 
export function stringToColor(color: string): Color | void {
    const colorNumbers = extractNumbers(color);
    if (colorNumbers.length < 3 || colorNumbers.length > 4) { return; }
    const result = getBestMatchColor({R: colorNumbers[0], G: colorNumbers[1], B: colorNumbers[2]});
    const colorSum = colorNumbers[0] + colorNumbers[1] + colorNumbers[2];
    const resultColorSum = result.R + result.G + result.B;
    let coef = 0;
    if (resultColorSum > colorSum) {
        coef = -(resultColorSum - colorSum) / resultColorSum;
    } else if (resultColorSum < colorSum) {
        coef = (colorSum - resultColorSum) / ((255 * 3) - resultColorSum)
    }
    result.brightness = Math.round(coef * 100) / 100;
    result.opacity = colorNumbers.length === 4 ? colorNumbers[3] : undefined;
    return result;
}

/**
 * Extract numbers from color string.
 * 
 * @param str - Color string, for example `rgb(10, 10, 10)` or `rgba(10, 10, 10, 0.5)`.
 * @returns - Array with numbers extracted from color string, [10, 10, 10, 0.1].
 */
function extractNumbers(str: string): number[] {
    const result: number[] = [];
    let currentNumber: string = "";
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        // 0-9
        if (charCode <= 57 && charCode >= 48) {currentNumber += str.charAt(i)}
        // decimal dot
        else if (charCode ===  46) {currentNumber += str.charAt(i)}
        // all other symbols
        else if (currentNumber.length > 0) {
            result.push(parseFloat(currentNumber));
            currentNumber = "";
        }
    }
    return result;
}

/**
 * Analize color object and return color from standart colors list which is closest to specified color.
 * 
 * @param color - Color object.
 * @returns - Color object.
 */
function getBestMatchColor(color: Color): Color{
    const {R, G, B} = color;
    // R/G/B components are the same so it's one of grey shades.
    if (R === G && G === B) {return {...standartColors[standartColors.length - 1]};}
    let bestMatchId = 0;
    let bestDiff = 255
    for (let i = 0; i < standartColors.length; i ++) {
        const stCol = standartColors[i];
        let diff = 256;
        const coefs: number[] = [];
        if (stCol.R >= R && stCol.G >= G && stCol.B >= B) {
            if (stCol.R !== R) {coefs.push((stCol.R - R) / stCol.R)}
            if (stCol.G !== G) {coefs.push((stCol.G - G) / stCol.G)}
            if (stCol.B !== B) {coefs.push((stCol.B - B) / stCol.B)}
        } else if (stCol.R <= R && stCol.G <= G && stCol.B <= B) {
            if (stCol.R !== 256 && stCol.R !== R) {coefs.push((R - stCol.R) / (255.1 - stCol.R))}
            if (stCol.G !== 256 && stCol.G !== G) {coefs.push((G - stCol.G) / (255.1- stCol.G))}
            if (stCol.B !== 256 && stCol.B !== B) {coefs.push((B - stCol.B) / (255.1 - stCol.B))}
        }
        // No need to proceed farther, this is the exact color.
        if (coefs.length === 0) {return {...standartColors[i]};}
        diff = Math.max(...coefs) - Math.min(...coefs);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestMatchId = i
        }
    }
    return {...standartColors[bestMatchId]};
}

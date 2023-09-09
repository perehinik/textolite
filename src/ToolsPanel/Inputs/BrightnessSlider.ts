/**
 * @module BrightnessSlider - Module contains implementation of slider used to change brightnes.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { RangeSlider } from "./Slider";
import { brightnessIcon, buildSVG } from "../Icons";

/**
 * Class implements slider with srightness icon.
 */
export class BrightnessSlider{
    private value: number = 0;
    Element: HTMLDivElement;
    onStateChange: (value: number) => void;
    valueBox: HTMLDivElement;
    slider: RangeSlider;

    /**
     * Brightness slider constructor.
     *
     * @param onStateChange - Callback for brightness update.
     */
    constructor(onStateChange: (value: number) => void) {
        this.onStateChange = onStateChange;
        this.sliderValueChanged = this.sliderValueChanged.bind(this);

        this.Element = this.buildElement();
        this.slider = new RangeSlider(-100, 100, 1, this.value, this.sliderValueChanged);
        this.valueBox = this.buildValueBox();

        this.Element.appendChild(this.buildBrightnesIcon());
        this.Element.appendChild(this.slider.Element);
        this.Element.appendChild(this.valueBox);
    }

    /**
     * Callback for slider value update.
     *
     * @param value - New slider value.
     */
    sliderValueChanged(value: number): void {
        this.valueBox.textContent = "" + value;
        this.onStateChange(value);
    }

    /**
     * Build root element div.
     *
     * @return - Root element.
     */
    buildElement(): HTMLDivElement {
        const element = document.createElement("div");
        element.style.width = "100%";
        element.style.height = "30px";
        element.style.display = "flex";
        element.style.justifyContent = "center";
        element.style.alignItems = "center";
        return element;
    }

    /**
     * Build brightness icon.
     *
     * @return - Div with brightness icon.
     */
    buildBrightnesIcon(): HTMLDivElement {
        const div = document.createElement("div");
        div.style.display = 'flex';
        div.style.justifyContent = "center";
        div.style.width = '50px';
        div.style.height = '16px';
        const svgImg = buildSVG(brightnessIcon, "16px", "16px");
        div.appendChild(svgImg);
        return div;
    }

    /**
     * Build div with value representing slider position.
     *
     * @return - Div with value representing slider position.
     */
    buildValueBox(): HTMLDivElement {
        const valueBox = document.createElement("div");
        valueBox.style.display = 'block';
        valueBox.style.width = '50px';
        valueBox.style.color = 'black';
        valueBox.style.fontSize = '13px';
        valueBox.style.textAlign = "center";
        valueBox.style.alignItems = "center";
        valueBox.style.verticalAlign = "middle"
        valueBox.style.lineHeight = '1';
        valueBox.textContent = "0";
        return valueBox;
    }

    /**
     * Set slider position.
     *
     * @param newValue - New slider position.
     */
    setValue(newValue: number): void {
        this.slider.setValue(newValue);
        this.valueBox.textContent = "" + newValue;
        this.value = newValue;
        this.onStateChange(newValue);
    }
    
    /**
     * Returns number representing current slider position.
     *
     * @returns - Number representing current slider position.
     */
    getValue(): number {
        return this.slider.value;
    }
}

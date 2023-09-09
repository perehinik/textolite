/**
 * @module Slider - Module contains implementation of slider - input element with custom style.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { CSSObj, buildStyleNode } from "../../Styling";

/**
 * Class implements range slider.
 */
export class RangeSlider{
    Element: HTMLInputElement;
    onStateChange: (position: number) => void;
    eventEnabled: boolean = true;
    value: number;

    /**
     * Slider constructor.
     *
     * @param min - Minimum value.
     * @param max - Maximum value.
     * @param step - Slider step.
     * @param value - Initial slider value.
     * @param onStateChange - Callback for slider position update.
     */
    constructor(min: number, max: number, step: number, value: number, onStateChange: (position: number) => void) {
        this.Element = document.createElement("input");
        this.Element.type = "range";
        this.Element.min = `${min}`;
        this.Element.max = `${max}`;
        this.Element.step = `${step}`;
        this.Element.value = `${value}`;
        this.valueChanged = this.valueChanged.bind(this);

        const styleNode = buildStyleNode(sliderStyle, sliderStyleHover, webkitThumbStyle, firefoxThumbStyle);
        this.Element.className = "sliderStyle";
        this.Element.addEventListener("input", this.valueChanged);
        this.value = 0;
        this.Element.appendChild(styleNode);
        this.onStateChange = onStateChange;
    }

    /**
     * Set slider position.
     *
     * @param value - New position.
     */
    setValue(value: number): void {
        this.Element.value = "" + value;
        this.value = value;
    }

    /**
     * Slider movement event handler.
     */
    valueChanged(): void {
        this.value = parseInt(this.Element.value);
        this.onStateChange(this.value);
    }
}

const sliderStyle: CSSObj = {
    selector: ".sliderStyle",
    "-webkit-appearance": "none",
    "appearance": "none",
    "width": "150px",
    "height": "2px",
    "background": "#d3d3d3",
    "outline": "none",
    "opacity": "0.7"
}

const sliderStyleHover: CSSObj = {
    selector: ".sliderStyle:hover",
    "opacity": "1"
}

const webkitThumbStyle: CSSObj = {
    selector: ".sliderStyle::-webkit-slider-thumb",
    // removing default appearance
    "-webkit-appearance": "none",
    "appearance": "none",
    "height": "11px",
    "width": "11px",
    "background-color": "rgb(50, 50, 50);",
    "border-radius": "50%",
    "border": "none"
}

const firefoxThumbStyle: CSSObj = {
    selector: ".sliderStyle::-moz-range-thumb",
    "height": "11px",
    "width": "11px",
    "background-color": "rgb(50, 50, 50);",
    "border-radius": "50%",
    "border": "none"
}

/**
 * @module TextBkGndColorButton - Module contains implementation of button for changing background color.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { buildSVG, fontFamilyIcon } from "../Icons";
import { ColorPanel } from "./ColorPanel";
import { DropDownButton } from "./DropDownButton";
import { CSSObj } from "../../Styling";

/**
 * Class implements button for changing text background color.
 */
export class TextBkGndColorButton extends DropDownButton {
    onStateChange: (style: CSSObj) => void;
    colorPan: ColorPanel;
    buttonImg: HTMLElement;
    colorStripe: HTMLDivElement;

    /**
     * Toolbox button constructor.
     *
     * @param onStateChange - Callback for button state update.
     */
    constructor(onStateChange: (style: CSSObj) => void) {
        super();
        this.onStateChange = onStateChange;
        this.colorChanged = this.colorChanged.bind(this);
        this.onClickHandler = this.onClickHandler.bind(this);
        
        this.buttonImg = buildSVG(fontFamilyIcon, "13px", "13px");
        this.buttonImg.style.fill = "white";
        this.buttonImg.style.backgroundColor = "rgb(0, 0, 0)"
        this.buttonImg.style.borderRadius = "3px";
        this.buttonImg.style.marginTop = "1px";
        this.buttonImg.style.marginBottom = "1px";

        this.button.style.width = "20px";
        this.button.appendChild(this.buttonImg);

        this.colorStripe = this.buildColorStripe();
        this.button.appendChild(this.colorStripe);

        this.colorPan = new ColorPanel(this.colorChanged);
        this.dropDownArrow.appendDropDown(this.colorPan.Element);
        this.dropDownArrow.hideDropDownOnClick = false;
    }

    /**
     * Build stripe showing current color.
     *
     * @returns - Div element which shows current color.
     */
    buildColorStripe(): HTMLDivElement {
        const colorStripe = document.createElement("div");
        colorStripe.style.height = "3px";
        colorStripe.style.width = "16px";
        colorStripe.style.border = "1px solid rgb(200, 200, 200)";
        colorStripe.style.borderRadius = "2px";
        colorStripe.style.backgroundColor = "black";
        return colorStripe;
    }

    /**
     * Calback for button click event.
     *
     * @param ev - Mouse event.
     */
    onClickHandler(ev: MouseEvent): void {
        super.onClickHandler(ev);
        this.onStateChange({"background-color": this.colorStripe.style.backgroundColor});
    }

    /**
     * Calback for color change event.
     *
     * @param color - New background color.
     */
    colorChanged(color: string): void {
        this.colorStripe.style.backgroundColor = color;
        this.onStateChange({"background-color": color});
    }
}

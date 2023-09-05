/**
 * @module Button - Module contains implementation of editor tolbox button.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { buildSVG, fontFamilyIcon } from "../icon/icons";
import { ColorPanel } from "./ColorPanel";
import { DropDownButton } from "./DropDownButton";




/**
 * Class implements editor toolbox button functionality.
 */
export class TextColorButton extends DropDownButton {
    onStateChange: Function;
    colorPan: ColorPanel;
    colorStripe: HTMLDivElement;

    /**
     * Toolbox button constructor.
     *
     * @param onStateChange - Callback for button state update.
     */
    constructor(onStateChange: Function) {
        super();
        this.onStateChange = onStateChange;
        this.colorChanged = this.colorChanged.bind(this);
        this.onClickHandler = this.onClickHandler.bind(this);
        
        const svgImg = buildSVG(fontFamilyIcon, "15px", "15px");
        this.button.style.width = "20px";
        this.button.appendChild(svgImg);
        
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
        this.onStateChange({"color": this.colorStripe.style.backgroundColor});
    }

    /**
     * Calback for color change event.
     *
     * @param color - New background color.
     */
    colorChanged(color: string): void {
        this.colorStripe.style.backgroundColor = color;
        this.onStateChange({"color": color});
    }
}

/**
 * @module AlignPanel - Module contains implementation of buttons for text alignment.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { CSSObj } from "../../Styling";
import { 
    alignLeftIcon, 
    alignCenterIcon, 
    alignRightIcon, 
    alignJustifyIcon, 
    buildSVG 
} from "../icon/icons";

/**
 * Enumerator for all possible alignment states.
 */
export const alignState = {
    None: 0,
    Left: 1,
    Center: 2,
    Right: 3,
    Justify: 4
};

/**
 * Class implements alignment toolbox switcher functionality.
 */
export class AlignPanel{
    state: number = 0;
    Element: HTMLDivElement;
    leftAlignButton: HTMLButtonElement;
    centerAlignButton: HTMLButtonElement;
    rightAlignButton: HTMLButtonElement;
    justifyAlignButton: HTMLButtonElement;
    onStateChange: Function;

    /**
     * Alignment panel constructor.
     *
     * @param onStateChange - Callback for alignment update.
     */
    constructor(onStateChange: Function) {
        this.Element = document.createElement("div");
        this.Element.style.display = "inline-block";
        this.onStateChange = onStateChange;
        
        this.onClickHandler = this.onClickHandler.bind(this);

        this.leftAlignButton = this.createButton(alignLeftIcon, alignState.Left);
        this.centerAlignButton = this.createButton(alignCenterIcon, alignState.Center);
        this.rightAlignButton = this.createButton(alignRightIcon, alignState.Right);
        this.justifyAlignButton = this.createButton(alignJustifyIcon, alignState.Justify);

        this.Element.appendChild(this.leftAlignButton);
        this.Element.appendChild(this.centerAlignButton);
        this.Element.appendChild(this.rightAlignButton);
        this.Element.appendChild(this.justifyAlignButton);
    }
    
    /**
     * Alignment panel constructor.
     *
     * @param icon: - String with SVG icon.
     * @param onClickState - Callback for button click.
     * @returns - Single button element for alignment panel.
     */
    createButton(icon: string, onClickState: number): HTMLButtonElement {
        const button = document.createElement("button");
        const svgImg = buildSVG(icon, "20px", "20px");
        button.appendChild(svgImg);
        button.style.border = "none";
        button.style.padding = "none";
        button.style.backgroundColor = "transparent";
        button.onmousedown = (event) => {event.preventDefault();};
        button.addEventListener("click", () => {this.onClickHandler(onClickState)}, false);
        return button;
    }

    /**
     * Handler for alignment panel button click.
     *
     * @param state - Number, reprezenting alignment type from `alignState` enumerator.
     */
    onClickHandler(state: number): void {
        if(state === this.state) {return;}
        this.setState(state);
        let style = this.getStyleByState(state);

        if (this.onStateChange) {
            this.onStateChange(style);
        }
    }

    /**
     * Convert number, reprezenting alignment type from `alignState` enumerator to CSS style.
     *
     * @param state - Number, reprezenting alignment type from `alignState` enumerator.
     * @returns - CSSObj style.
     */
    getStyleByState(state: number): CSSObj {
        switch (state) {
            case alignState.Left: return {"text-align": "left"};
            case alignState.Center: return {"text-align": "center"};
            case alignState.Right: return {"text-align": "right"};
            case alignState.Justify: return {"text-align": "justify"};
            default: return {};
        }
    }

    /**
     * Convert CSS style to number reprezenting alignment type from `alignState` enumerator.
     *
     * @param style - CSSObj style.
     * @returns - Number, reprezenting alignment type from `alignState` enumerator.
     */
    getStateByStyle(style: CSSObj): number {
        const textAlign = style["text-align"];
        switch (textAlign) {
            case "left": return alignState.Left;
            case "center": return alignState.Center;
            case "right": return alignState.Right;
            case "justify": return alignState.Justify;
            default: return alignState.None;
        }
    }

    /**
     * Set alignment panel state state without firing button state update callback.
     *
     * @param newState - Number, reprezenting alignment type from `alignState` enumerator.
     */
    setState(newState: number): void {
        if(newState === this.state) {return;}
        this.state = newState;
        this.setButtonStyle(this.leftAlignButton, this.state === alignState.Left);
        this.setButtonStyle(this.centerAlignButton, this.state === alignState.Center);
        this.setButtonStyle(this.rightAlignButton, this.state === alignState.Right);
        this.setButtonStyle(this.justifyAlignButton, this.state === alignState.Justify);
    }

    /**
     * Set alignment panel state state without firing button state update callback.
     *
     * @param style - CSSObj style.
     */
    setStateByStyle(style: CSSObj): void {
        this.setState(this.getStateByStyle(style));
    }

    /**
     * Set alignment panel button style depending on state.
     *
     * @param button - HTML button element instance.
     * @param state - Boo;ean true-ON or false-OFF.
     */
    setButtonStyle(button: HTMLButtonElement, state: boolean): void {
        if (state) {
            button.style.backgroundColor = "rgba(200, 200, 200, 0.5)"
        } else {
            button.style.backgroundColor = "transparent"
        }
    }
    
    /**
     * Returns object representing current alignment panel state.
     *
     * @returns - Object representing current button state.
     */
    getValue(): object {
        return this.getStyleByState(this.state);
    }
}

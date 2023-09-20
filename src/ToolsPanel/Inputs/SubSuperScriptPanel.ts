/**
 * @module SubSuperScriptButton - Module contains implementation of buttons for setting vertical text alignment.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { CSSObj } from "../../Styling";
import { 
    subscriptIcon,
    superscriptIcon,
    buildSVG 
} from "../Icons";

/**
 * Enumerator for all possible states.
 */
export const scriptState = {
    None: 0,
    Superscript: 1,
    Subscript: 2,
};

/**
 * Class implements vertical alignment toolbox switcher functionality.
 */
export class SubSuperScriptPanel{
    state: number = 0;
    Element: HTMLDivElement;
    superscriptButton: HTMLButtonElement;
    subscriptButton: HTMLButtonElement;
    onStateChange: (style: CSSObj) => void;

    /**
     * Alignment panel constructor.
     *
     * @param onStateChange - Callback for alignment update.
     */
    constructor(onStateChange: (style: CSSObj) => void) {
        this.Element = document.createElement("div");
        this.Element.style.display = "inline-flex";
        this.Element.style.height = "25px";
        this.Element.style.alignItems = "center";
        this.Element.style.minWidth = "64px";
        this.onStateChange = onStateChange;
        
        this.onClickHandler = this.onClickHandler.bind(this);

        this.superscriptButton = this.createButton(superscriptIcon, scriptState.Superscript);
        this.subscriptButton = this.createButton(subscriptIcon, scriptState.Subscript);
        this.Element.appendChild(this.superscriptButton);
        this.Element.appendChild(this.subscriptButton);
    }
    
    /**
     * Button builder.
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
        button.style.display = "inline-flex";
        button.style.height = "25px";
        button.style.alignItems = "center";
        button.style.backgroundColor = "transparent";
        button.onmousedown = (event) => {event.preventDefault();};
        button.addEventListener("click", () => {this.onClickHandler(onClickState)}, false);
        return button;
    }

    /**
     * Handler for script panel button click.
     *
     * @param state - Number, reprezenting script type from `scriptState` enumerator.
     */
    onClickHandler(state: number): void {
        if(state === this.state) {
            state = scriptState.None;
        }
        this.setState(state);
        const style = this.getStyleByState(state);

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
            case scriptState.Subscript: return {"vertical-align": "sub"};
            case scriptState.Superscript: return {"vertical-align": "super"};
            default: return {"vertical-align": "baseline"};
        }
    }

    /**
     * Convert CSS style to number reprezenting alignment type from `alignState` enumerator.
     *
     * @param style - CSSObj style.
     * @returns - Number, reprezenting alignment type from `alignState` enumerator.
     */
    getStateByStyle(style: CSSObj): number {
        const textAlign = style["vertical-align"];
        switch (textAlign) {
            case "sub": return scriptState.Subscript;
            case "super": return scriptState.Superscript;
            default: return scriptState.None;
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
        this.setButtonStyle(this.subscriptButton, this.state === scriptState.Subscript);
        this.setButtonStyle(this.superscriptButton, this.state === scriptState.Superscript);
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
    getValue(): CSSObj {
        return this.getStyleByState(this.state);
    }
}

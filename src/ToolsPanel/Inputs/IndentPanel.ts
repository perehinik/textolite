/**
 * @module IndentButton - Module contains implementation of buttons for changing paragraph indent.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { CSSObj, buildStyleNode } from "../../Styling";
import { 
    indentIncreaseIcon,
    indentDecreaseIcon,
    buildSVG 
} from "../Icons";

const buttonStyle: CSSObj = {
    selector: ".button1Style",
    'background': 'transparent',
}

const buttonStyleActive: CSSObj = {
    selector: ".button1Style:active",
    'background': 'rgba(200, 200, 200, 0.5)',    
}

const buttonStyleNode = buildStyleNode( buttonStyle, buttonStyleActive );

/**
 * Class implements bnuttons to change paragraph indent.
 */
export class IndentPanel{
    state: number = 1;
    Element: HTMLDivElement;
    increaseIndentButton: HTMLButtonElement;
    decreaseIndentButton: HTMLButtonElement;
    indentState: HTMLDivElement;
    onStateChange: (style: CSSObj) => void;

    /**
     * Indent buttons constructor.
     *
     * @param onStateChange - Callback for indent update.
     */
    constructor(onStateChange: (style: CSSObj) => void) {
        this.Element = document.createElement("div");
        this.Element.style.display = "inline-flex";
        this.Element.style.height = "25px";
        this.Element.style.alignItems = "center";
        this.Element.style.minWidth = "64px";
        this.onStateChange = onStateChange;
        
        this.onClickHandler = this.onClickHandler.bind(this);

        this.increaseIndentButton = this.createButton(indentIncreaseIcon, 1);
        this.decreaseIndentButton = this.createButton(indentDecreaseIcon, -1);
        this.indentState = document.createElement("div");
        this.indentState.textContent = `${this.state}`;
        this.indentState.style.fontFamily = "Arial";
        this.indentState.style.fontSize = "16px";

        this.Element.appendChild(buttonStyleNode);
        this.Element.appendChild(this.decreaseIndentButton);
        this.Element.appendChild(this.indentState);
        this.Element.appendChild(this.increaseIndentButton);
    }
    
    /**
     * Button builder.
     *
     * @param icon: - String with SVG icon.
     * @param onClickState - Callback for button click.
     * @returns - Single button element for indent panel.
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
        button.classList.add("button1Style");
        button.onmousedown = (event) => {event.preventDefault();};
        button.addEventListener("click", () => {this.onClickHandler(onClickState)}, false);
        return button;
    }

    /**
     * Handler for button click.
     *
     * @param state - Number, reprezenting script type from `scriptState` enumerator.
     */
    onClickHandler(state: number): void {
        const newState = this.state + state;
        this.setState(newState);
        if (this.onStateChange) {
            this.onStateChange({'text-indent': `${newState * 10}pt`});
        }
    }

    /**
     * Set panel state state without firing button state update callback.
     *
     * @param style - CSSObj style.
     */
    setStateByStyle(style: CSSObj): void {
        let indent = style['text-indent'];
        indent = indent && parseInt(indent) >= 0 ? indent : "10pt";
        this.state = Math.round(parseInt(indent) / 10);
        this.setState(this.state);
    }

    /**
     * Sets indent. Indent 1 coresponds to 10 pt.
     *
     * @param state - Indent, 1=10pt.
     */
    setState(state: number): void{
        if (state < 0) {state = 0;}
        if (state > 30) {state = 30;}
        this.state = state;
        this.indentState.textContent = `${this.state}`;
    }
    
    /**
     * Returns object representing current panel state.
     *
     * @returns - Object representing current button state.
     */
    getValue(): CSSObj {
        return {'text-indent': `${this.state * 10}pt`};
    }
}

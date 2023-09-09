/**
 * @module DropDownButton - Module contains implementation of base class for dropdown button.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { CSSObj, buildStyleNode } from "../../Styling";
import { DropDownArrow } from "./DropDownArrow";

/**
 * Styles for button when not pressed.
 */
const buttonStyle: CSSObj = {
    selector: ".buttonStyle",
    'background': 'transparent',
}

/**
 * Styles for button when pressed(active).
 */
const buttonStyleActive: CSSObj = {
    selector: ".buttonStyle:active",
    'background': 'rgba(200, 200, 200, 0.5)',    
}

/**
 * Node with button styles. 
 * Yes I know ,I can use css. It's just more fun to work with DOM directly.
 */
const buttonStyleNode = buildStyleNode(buttonStyle, buttonStyleActive);

/**
 * Implementation of base class for dropdown button
 */
export class DropDownButton {
    Element: HTMLDivElement;
    button: HTMLDivElement;
    dropDownArrow: DropDownArrow;

    /**
     * Dropdown button constructor.
     */
    constructor() {
        this.Element = this.buildElement();
        this.button = this.buildButton();

        this.dropDownArrow = new DropDownArrow(() => {});
        this.Element.appendChild(this.button);
        this.Element.appendChild(this.dropDownArrow.Element);

        this.connectEventHandlers();
    }

    /**
     * Connect handlers to events.
     */
    connectEventHandlers(): void {
        this.onClickHandler = this.onClickHandler.bind(this);
        this.Element.onmousedown = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
        };
        this.button.addEventListener("click", this.onClickHandler, false);
    }

    /**
     * Create main container for button.
     * 
     * @returns - Div container for all parts of button.
     */
    buildElement(): HTMLDivElement {
        const element = document.createElement("div");
        element.style.display = "flex";
        element.style.width = "32px";
        element.style.padding = "0px";
        element.style.justifyContent = "center";
        element.style.alignItems = "center";
        return element;
    }

    /**
     * Create button.
     * 
     * @returns - Button HTML element.
     */
    buildButton(): HTMLDivElement {
        const button = document.createElement("div");
        button.style.height = "25px";
        button.style.border = "none";
        button.style.display = "flex";
        button.style.flexDirection = "column";
        button.style.justifyContent = "center";
        button.style.alignItems = "center";
        button.appendChild(buttonStyleNode);
        button.classList.add("buttonStyle");
        return button;
    }

    /**
     * Calback for button click event.
     *
     * @param ev - Mouse event.
     */
    onClickHandler(ev: MouseEvent): void {
        ev.stopPropagation();
        ev.preventDefault();
    }
}

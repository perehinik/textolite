/**
 * @module Button - Module contains implementation of editor tolbox button.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { buildSVG } from "../icon/icons";

/**
 * Class implements editor toolbox button functionality.
 */
export class Button {
    state: boolean = false;
    Element: HTMLButtonElement;
    valueOn: object;
    valueOff: object;
    onStateChange: Function;

    /**
     * Toolbox button constructor.
     *
     * @param icon - String with SVG icon.
     * @param valueOn - Value for ON state of button.
     * @param valueOff - Value for OFF state of button.
     * @param onStateChange - Callback for button state update.
     */
    constructor(icon: string, valueOn: object, valueOff: object, onStateChange: Function) {
        this.onStateChange = onStateChange;
        this.Element = this.buildElement();
        this.valueOn = valueOn;
        this.valueOff = valueOff;
        
        const svgIcon = buildSVG(icon, "20px", "20px");
        this.Element.appendChild(svgIcon);
        this.connectEventHandlers();
    }

    /**
     * Connect handlers to events.
     */
    connectEventHandlers(): void {
        this.onClickHandler = this.onClickHandler.bind(this);
        this.Element.onmousedown = (event) => {event.preventDefault();};
        this.Element.addEventListener("click", this.onClickHandler, false);
    }

    /**
     * Build button element.
     *
     * @returns - Button HTML element.
     */
    buildElement(): HTMLButtonElement {
        const element = document.createElement("button");
        element.style.display = "inline-block";
        element.style.border = "none";
        element.style.padding = "none";
        element.style.backgroundColor = "transparent";
        return element;
    }
    
    /**
     * Calback for button state change.
     *
     * @param ev - Mouse event.
     */
    onClickHandler(ev?: MouseEvent) {
        this.setState(!this.state);
        if (this.onStateChange) {
            this.onStateChange(this.state ? this.valueOn : this.valueOff);
        }
    }

    /**
     * Set button state without firing button state update callback.
     *
     * @param newState - If true - button set to ON.
     */
    setState(newState: boolean): void {
        this.state = newState;
        if (this.state) {
            this.Element.style.backgroundColor = "rgba(200, 200, 200, 0.5)"
        } else {
            this.Element.style.backgroundColor = "transparent"
        }
    }
    
    /**
     * Returns object representing current button state.
     *
     * @returns - Object representing current button state.
     */
    getValue(): object {
        return this.state ? this.valueOn : this.valueOff;
    }
}

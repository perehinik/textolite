/**
 * @module DropDownArrow - Module contains implementation of button with dropdown container.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { buildSVG, arrowDownIcon } from "../Icons";

/**
 * Class implements arrow button used in dropdown menu.
 */
export class DropDownArrow {
    state: boolean = false;
    Element: HTMLDivElement;
    onStateChange: (state: boolean) => void;
    dropDownAnchor: HTMLDivElement;
    dropDownContainer: HTMLDivElement;
    dropDownWidth: number = 0;
    hideDropDownOnClick: boolean = true;
    arrowButton: HTMLDivElement;
    dropdownLeft: number = 0;

    /**
     * Arrow button constructor.
     *
     * @param onStateChange - Callback for button state update.
     */
    constructor(onStateChange: (state: boolean) => void) {
        this.onStateChange = onStateChange;
        this.Element = this.buildElement();
        this.arrowButton = this.buildButton();
        this.dropDownAnchor = this.buildDropDownAnchor();
        this.dropDownContainer = this.buildDropDownContainer();

        this.Element.appendChild(this.arrowButton);
        this.Element.appendChild(this.dropDownAnchor);
        this.dropDownAnchor.appendChild(this.dropDownContainer);
        
        this.connectEventHandlers();
        this.setState(false);
    }

    /**
     * Adds specified node to dropdown container.
     *
     * @param nd - Node that should be added to dropdown.
     */
    appendDropDown(nd: Node | HTMLDivElement): void {
        this.dropDownContainer.appendChild(nd);
    }

    /**
     * Connect handlers to events.
     */
    connectEventHandlers(): void {
        this.onClickHandler = this.onClickHandler.bind(this);
        this.onDocClickHandler = this.onDocClickHandler.bind(this);
        this.onDropDownMouseEvent = this.onDropDownMouseEvent.bind(this);

        // Arrow mousedown should propagate, click shouldn't
        this.arrowButton.onmousedown = (ev) => {ev.preventDefault();};
        this.arrowButton.addEventListener("click", this.onClickHandler, false);
        this.Element.onmousedown = this.onDropDownMouseEvent;
        document.addEventListener("click", this.onDocClickHandler, false);
        this.dropDownContainer.addEventListener("click", this.onDropDownMouseEvent, false)
    }

    /**
     * Calback for button click event.
     *
     * @param ev - Mouse event.
     */
    onClickHandler(ev: MouseEvent): void {
        this.setState(!this.state);
        ev.stopPropagation();
    }

    /**
     * Calback for click on document outside button and dropdown.
     * Used to close dropdown.
     *
     * @param ev - Mouse event.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDocClickHandler(ev?: MouseEvent): void {
        if (this.state) {
            this.setState(false);
        }
    }

    /**
     * Disables event propagation for events which were initialized inside dropdown container.
     */
    onDropDownMouseEvent(ev: MouseEvent | TouchEvent): void {
        if (!this.hideDropDownOnClick) {
            if (!(ev.target as Node)?.nodeName || (ev.target as Node)?.nodeName.toUpperCase() !== "INPUT") {
                // For inputs mousedown should be default to enable interaction like slider movement.
                ev.preventDefault()
            }
            ev.stopPropagation();
        }
    }

    /**
     * Create main container for button.
     * 
     * @returns - Div container for all parts of button.
     */
    buildElement(): HTMLDivElement {
        const element = document.createElement("div");
        element.style.display = "flex";
        element.style.width = "10px";
        element.style.height = "25px";
        element.style.padding = "-2px";
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
        const svgImg = buildSVG(arrowDownIcon, "12px", "12px");
        button.appendChild(svgImg);
        button.style.display = "flex";
        button.style.flexDirection = "column";
        button.style.justifyContent = "center";
        button.style.alignItems = "center";
        button.style.backgroundColor = "transparent";
        return button;
    }

    /**
     * Builds the anchor for dropdown. The key is that position is relative.
     * 
     * @returns - Div container for all parts of button.
     */
    buildDropDownAnchor(): HTMLDivElement {
        const dropDownAnchor = document.createElement("div");
        dropDownAnchor.style.position = "relative";
        dropDownAnchor.style.height = "3px";
        return dropDownAnchor;
    }

    /**
     * Builds the anchor for dropdown. The key is that position is relative.
     * 
     * @returns - Div container dropdown menu.
     */
    buildDropDownContainer(): HTMLDivElement {
        const dropDownContainer = document.createElement("div");
        dropDownContainer.style.zIndex = "3422";
        dropDownContainer.style.position = "absolute";
        dropDownContainer.style.border = "1px solid gray";
        dropDownContainer.style.boxShadow = "3px 3px 4px rgb(220, 220, 220)";
        dropDownContainer.style.display = "null";
        return dropDownContainer;
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
            this.dropDownContainer.style.display = "block";
            this.adjustPosition();
        } else {
            this.Element.style.backgroundColor = "transparent"
            this.dropDownContainer.style.display = "none";
        }
        this.onStateChange(this.state);
    }

    /**
     * Adjust dropdown position so it doesn't overflow.
     */
    adjustPosition(): void {
        const elRect = this.dropDownContainer.getBoundingClientRect();
        const elWidth = elRect.width != 0 ? elRect.width : this.dropDownWidth;
        this.dropDownWidth = elWidth;

        const btRect = this.dropDownAnchor.getBoundingClientRect();
        const docWidth = document.body.getBoundingClientRect().width;
        const btPos = btRect.left + btRect.width / 2

        let left = 0;
        const top = btRect.height + 10
        const expectedRightPos = btPos + elWidth / 2;
        const expectedLeftPos = btPos - elWidth / 2;
        if (expectedLeftPos < 5) { left = -btPos + 5;}
        else if (expectedRightPos + 5 <= docWidth) { left = -elWidth / 2 + btRect.width / 2; }
        else { left = docWidth - btRect.left - elWidth - 5; }
        left += this.dropdownLeft;
        
        this.dropDownContainer.style.left = left + "px";
        this.dropDownContainer.style.top = top + "px"
    }
}

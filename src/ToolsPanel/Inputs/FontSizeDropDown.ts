/**
 * @module FontSizeDropDown - Module contains implementation of dropdown button with font sizes.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { DropDownButton } from "./DropDownButton";
import { CSSObj, buildStyleNode } from "../../Styling";

/**
 * Styles for button when not pressed.
 */
const fontButtonStyle: CSSObj = {
    selector: ".fontButtonStyle",
    'background': 'transparent',
}

/**
 * Styles for button during hover.
 */
const fontButtonnStyleHover: CSSObj = {
    selector: ".fontButtonStyle:hover",
    'background': 'rgba(200, 200, 200, 0.5)',    
}

/**
 * Node with text button styles.
 */
const fontButtonStyleNode = buildStyleNode(fontButtonStyle, fontButtonnStyleHover);


/**
 * Class implements button for changing text font sizes.
 */
export class FontSizeDropDown extends DropDownButton {
    onStateChange: (state: CSSObj) => void;
    availableSizes: string[];
    currentFontSize: string = "";
    fontSizeWidget: HTMLDivElement;
    fontSizeContainer: HTMLDivElement;

    /**
     * Font size dropdown constructor.
     *
     * @param onStateChange - Callback for button state update.
     */
    constructor(onStateChange: (state: CSSObj) => void) {
        super();
        this.onStateChange = onStateChange;
        this.fontChanged = this.fontChanged.bind(this);
        this.onClickHandler = this.onClickHandler.bind(this);
        this.availableSizes = [
            '6pt', '7pt', '8pt', '9pt', '10pt', '11pt', '12pt', 
            '14pt', '16pt', '18pt', '20pt', '22pt', '24pt', '26pt', '28pt', 
            '32pt', '36pt', '40pt', '44pt', '48pt', '52pt'
        ];

        this.Element.style.width = "54px";
        this.button.style.width = "40px";
        this.dropDownArrow.dropdownLeft = -26;
        this.fontSizeWidget = this.buildFontSizeWidget();
        this.button.appendChild(this.fontSizeWidget);

        this.fontSizeContainer = this.buildFontSizeDropDown();
        this.dropDownArrow.appendDropDown(this.fontSizeContainer);
        this.dropDownArrow.hideDropDownOnClick = true;
    } 

    /**
     * Creates container for dropdown with buttons for font sizes.
     * 
     * @returns - Div container with buttons for font sizes.
     */
    buildFontSizeDropDown(): HTMLDivElement {
        const container = document.createElement("div");
        container.style.overflowY = "scroll";
        container.style.height = "150px";
        container.style.backgroundColor = "white";
        container.appendChild(fontButtonStyleNode);
        for (let i = 0; i < this.availableSizes.length; i++) {
            const button = this.buildFontSizeButton(this.availableSizes[i]);
            button.addEventListener('click', () => this.fontChanged(this.availableSizes[i]));
            container.appendChild(button);
        }
        return container;
    }

    /**
     * Creates widget displaying current font size.
     * 
     * @returns - Div container displaying current font size.
     */
    buildFontSizeWidget(): HTMLDivElement {
        const widget = document.createElement("div");
        widget.style.display = "flex";
        widget.style.alignItems = "center";
        widget.style.verticalAlign = "baseline";
        widget.style.overflow = "hidden";
        widget.style.whiteSpace = "nowrap";
        widget.style.lineHeight = "1";
        widget.style.textIndent = "1";

        widget.style.width = "35px";
        widget.style.height = "20px";
        widget.style.fontSize = "14px";
        widget.style.padding = "1px 3px 1px 2px";
        widget.style.backgroundColor = "white";
        widget.style.border = "1px solid grey";
        widget.textContent = "12pt";
        return widget;
    }

    /**
     * Builds single font size button for dropdowm menu.
     * 
     * @param fontSize: Font size.
     * @returns - Div container with font size button.
     */
    buildFontSizeButton(fontSize: string): HTMLDivElement {
        const button = document.createElement("div");
        button.style.fontFamily = fontSize;
        button.textContent = fontSize;
        button.style.height = "28px";
        button.style.fontSize = "14px";
        button.style.display = "flex";
        button.style.padding = "2px 4px 0px 5px";
        button.style.alignItems = "center";
        button.style.verticalAlign = "baseline";
        button.style.overflow = "hidden";
        button.style.whiteSpace = "nowrap";
        button.style.lineHeight = "1";
        button.style.textIndent = "1";
        button.classList.add("fontButtonStyle");
        return button;
    }

    /**
     * Set current font size based on specified style.
     *
     * @param style - CSSObj style.
     */
    setStateByStyle(style: CSSObj): void {
        let font = style["font-size"];
        if (!font || !this.availableSizes.includes(font)) {
            font = "";
        }
        this.currentFontSize = font;
        this.fontSizeWidget.style.fontFamily = font;
        this.fontSizeWidget.textContent = font;
    }

    /**
     * Handler for button click event. If click is on current font widget - also open dropdown.
     *
     * @param ev - Mouse event.
     */
    onClickHandler(ev: MouseEvent): void {
        super.onClickHandler(ev);
        this.dropDownArrow.setState(!this.dropDownArrow.state);
    }

    /**
     * Handler for font size change event.
     *
     * @param fontSize - New font size.
     */
    fontChanged(fontSize: string): void {
        this.currentFontSize = fontSize;
        this.onStateChange({"font-size": fontSize});
        this.fontSizeWidget.style.fontFamily = fontSize;
        this.fontSizeWidget.style.color = "black";
        this.fontSizeWidget.textContent = fontSize;
    }
}

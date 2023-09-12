/**
 * @module FontDropDown - Module contains implementation of dropdown button with fonts.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { DropDownButton } from "./DropDownButton";
import { getAvailableFonts } from "./Fonts";
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
 * Class implements button for changing text font.
 */
export class FontDropDown extends DropDownButton {
    onStateChange: (state: CSSObj) => void;
    availableFonts: string[];
    currentFont: string = "";
    fontWidget: HTMLDivElement;
    latestFontsContainer: HTMLDivElement;
    fontsContainer: HTMLDivElement;
    latestFonts: string[] = [];
    latestFontsMaxNum: number = 4;
    latestFontsId: number = 0;

    /**
     * Font dropdown constructor.
     *
     * @param onStateChange - Callback for button state update.
     */
    constructor(onStateChange: (state: CSSObj) => void) {
        super();
        this.onStateChange = onStateChange;
        this.fontChanged = this.fontChanged.bind(this);
        this.onClickHandler = this.onClickHandler.bind(this);
        this.latestFontChosen = this.latestFontChosen.bind(this);
        this.availableFonts = getAvailableFonts();

        this.Element.style.width = "160px";
        this.button.style.width = "150px";
        this.dropDownArrow.dropdownLeft = -94;
        this.fontWidget = this.buildFontWidget();
        this.button.appendChild(this.fontWidget);

        this.latestFontsContainer = document.createElement("div");
        this.fontsContainer = this.buildFontsDropDown();
        this.dropDownArrow.appendDropDown(this.fontsContainer);
        this.dropDownArrow.hideDropDownOnClick = true;
    } 

    /**
     * Creates container for dropdown with buttons for all fonts.
     * 
     * @returns - Div container with buttons for all available fonts.
     */
    buildFontsDropDown(): HTMLDivElement {
        const container = document.createElement("div");
        container.style.overflowY = "scroll";
        container.style.height = "130px";
        container.style.backgroundColor = "white";
        container.appendChild(fontButtonStyleNode);
        container.appendChild(this.latestFontsContainer);
        for (let i = 0; i < this.availableFonts.length; i++) {
            const button = this.buildFontButton(this.availableFonts[i]);
            button.addEventListener('click', () => this.fontChanged(this.availableFonts[i]));
            container.appendChild(button);
        }
        return container;
    }

    /**
     * Adds font to last 4 used fonts list so it's easier to find it in dropdown.
     * 
     * @param font - Font name.
     */
    addLatestFont(font: string): void {
        if (this.latestFonts.includes(font) || !this.availableFonts.includes(font)) {return;}
        if (this.latestFontsContainer.childNodes[this.latestFontsId]) {
            const fontButton = this.latestFontsContainer.childNodes[this.latestFontsId] as HTMLElement;
            fontButton.style.fontFamily = font;
            fontButton.textContent = font.replaceAll('"', '');
            this.latestFonts[this.latestFontsId] = font;
        } else {
            this.latestFonts.push(font);
            const button = this.buildFontButton(font);
            const id = this.latestFontsId;
            button.addEventListener('click', () => this.latestFontChosen(id));
            this.latestFontsContainer.appendChild(button);
            if (this.latestFontsId === 0 && this.latestFontsContainer.nextSibling) {
                const splitter = this.builldSplitter();
                this.fontsContainer.insertBefore(splitter, this.latestFontsContainer.nextSibling)
            }
        }
        this.latestFontsId = (this.latestFontsId + 1) % this.latestFontsMaxNum;
    }

    /**
     * Creates splitter between latest used fonts and all fonts.
     * 
     * @returns - Div container latest used fonts.
     */
    builldSplitter(): HTMLDivElement {
        const splitter = document.createElement("div");
        splitter.style.width = "100%";
        splitter.style.height = "3px";
        splitter.style.backgroundColor = "rgb(220, 220, 220)";
        return splitter;
    }

    /**
     * Creates widget displaying current font.
     * 
     * @returns - Div container displaying current font.
     */
    buildFontWidget(): HTMLDivElement {
        const widget = document.createElement("div");
        widget.style.display = "flex";
        widget.style.alignItems = "center";
        widget.style.verticalAlign = "baseline";
        widget.style.overflow = "hidden";
        widget.style.whiteSpace = "nowrap";
        widget.style.lineHeight = "1";
        widget.style.textIndent = "1";

        widget.style.width = "140px";
        widget.style.height = "20px";
        widget.style.fontSize = "13px";
        widget.style.padding = "1px 5px 1px 5px";
        widget.style.backgroundColor = "white";
        widget.style.border = "1px solid grey";
        widget.style.color = "gray";
        widget.textContent = "Select Font";
        return widget;
    }

    /**
     * Builds single font button for dropdowm menu.
     * 
     * @param font: Font name for button. Font name and preview will be displayed inside button.
     * @returns - Div container with font button.
     */
    buildFontButton(font: string): HTMLDivElement {
        const button = document.createElement("div");
        button.style.fontFamily = font;
        button.textContent = font.replaceAll('"', '');
        button.style.height = "28px";
        button.style.fontSize = "15px";
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
     * Set current font based on specified style.
     *
     * @param style - CSSObj style.
     */
    setStateByStyle(style: CSSObj): void {
        let font = style["font-family"];
        if (!font || !this.availableFonts.includes(font)) {
            font = "";
        }
        this.currentFont = font;
        this.fontWidget.style.fontFamily = font;
        this.fontWidget.style.color = "black";
        this.fontWidget.textContent = font.replaceAll('"', '');
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
     * Handler for click on font from latest used fonts list.
     *
     * @param latestFontId - Font id in latest fonts array.
     */
    latestFontChosen(latestFontId: number): void {
        const font = this.latestFonts[latestFontId];
        this.currentFont = font;
        this.onStateChange({"font-family": font});
        this.fontWidget.style.fontFamily = font;
        this.fontWidget.style.color = "black";
        this.fontWidget.textContent = font.replaceAll('"', '');
    }

    /**
     * Handler for font change event.
     *
     * @param font - New font.
     */
    fontChanged(font: string): void {
        this.addLatestFont(font);
        this.currentFont = font;
        this.onStateChange({"font-family": font});
        this.fontWidget.style.fontFamily = font;
        this.fontWidget.style.color = "black";
        this.fontWidget.textContent = font.replaceAll('"', '');
    }
}



/**
 * @module Tools - Module contains editor toolbox implementation.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { Button } from './Inputs/Button';
import { AlignPanel } from './Inputs/AlignPanel';
import { TextColorButton } from './Inputs/TextColorButton';
import { boldIcon, italicIcon, strikethroughIcon, underlineIcon } from './Icons'
import { CSSObj, applyOverlappingStyle, defaultStyle, buildStyleNode } from '../Styling';
import { TextBkGndColorButton } from './Inputs/TextBkGndColorButton';
import { FontDropDown } from './Inputs/FontDropDown';
import { FontSizeDropDown } from './Inputs/FontSizeDropDown';
import { SubSuperScriptPanel } from './Inputs/SubSuperScriptPanel';
import { IndentPanel } from './Inputs/IndentPanel';

/**
 * Styles for button when pressed(active).
 */
const unselectableStyle: CSSObj = {
    selector: ".unselectable > *",
    "-moz-user-select": "-moz-none",
    "-khtml-user-select": "none",
    "-webkit-user-select": "none",
    "-ms-user-select": "none",
    "user-select": "none",
}

/**
 * Node with button styles. 
 * Yes I know ,I can use css. It's just more fun to work with DOM directly.
 */
const unselectableStyleNode = buildStyleNode(unselectableStyle);

/**
 * Class implements editor toolbox functionality.
 */
export class Tools {
    onStyleChange: (style: CSSObj) => void;
    boldButton: Button;
    italicButton: Button;
    underlineButton: Button;
    strikethroughButton: Button;
    alignPanel: AlignPanel;
    fontColorButton: TextColorButton;
    fontBgColorButton: TextBkGndColorButton;
    fontSelector: FontDropDown;
    fontSizeSelector: FontSizeDropDown;
    subSuperScriptPanel: SubSuperScriptPanel;
    indentButton: IndentPanel;
    
    /**
     * Toolbox constructor.
     *
     * @param toolsDivNd - Node that shuld be used as container for toolbox.
     * @param onStyleChange - Callback, changes style of the selected areea in editor.
     */
    constructor(toolsDivNd: HTMLDivElement, onStyleChange: (style: CSSObj) => void) {
        this.onStyleChange = onStyleChange;
        if (toolsDivNd){toolsDivNd.innerHTML = '';}

        this.styleChanged = this.styleChanged.bind(this);
        toolsDivNd.appendChild(unselectableStyleNode);
        toolsDivNd.classList.add("unselectable");
        toolsDivNd.style.display = 'flex';
        toolsDivNd.style.flexWrap = 'wrap';
        toolsDivNd.style.alignItems = "center";
        toolsDivNd.style.paddingBottom = '2px';

        // BUILD TEXT FORMAT PANEL
        this.boldButton = new Button(boldIcon, {'font-weight': 'bold'}, {'font-weight': 'normal'}, this.styleChanged);
        this.italicButton = new Button(italicIcon, {'font-style': 'italic'}, {'font-style': 'normal'}, this.styleChanged);
        // To overvrite underline you can add display: inline-block, but it will introduce ugly bug for multiline mode - don't do that :).        
        this.underlineButton = new Button(underlineIcon, {'text-decoration': 'underline'}, {'text-decoration': 'none'}, this.styleChanged);
        this.strikethroughButton = new Button(strikethroughIcon, {'text-decoration': 'line-through'}, {'text-decoration': 'none'}, this.styleChanged);
        toolsDivNd.appendChild(this.boldButton.Element);
        toolsDivNd.appendChild(this.italicButton.Element);
        toolsDivNd.appendChild(this.underlineButton.Element);
        toolsDivNd.appendChild(this.strikethroughButton.Element);

        toolsDivNd.appendChild(this.createSplitter());

        // Sub / Super script panel
        this.subSuperScriptPanel = new SubSuperScriptPanel(this.styleChanged); 
        toolsDivNd.appendChild(this.subSuperScriptPanel.Element);
        toolsDivNd.appendChild(this.createSplitter());

        // BUILD TEXT ALIGN PANEL
        this.alignPanel = new AlignPanel(this.styleChanged);
        toolsDivNd.appendChild(this.alignPanel.Element);

        // BUILD COLOR PANEL
        const colorTools = document.createElement("div");
        colorTools.style.display = "flex";
        colorTools.appendChild(this.createSplitter());
        this.fontColorButton = new TextColorButton(this.styleChanged);
        colorTools.appendChild(this.fontColorButton.Element);
        this.fontBgColorButton = new TextBkGndColorButton(this.styleChanged);
        colorTools.appendChild(this.fontBgColorButton.Element);
        toolsDivNd.appendChild(colorTools);

        // INDENT
        this.indentButton = new IndentPanel(this.styleChanged);
        toolsDivNd.appendChild(this.createSplitter());
        toolsDivNd.appendChild(this.indentButton.Element);

        const fontTools = document.createElement("div");
        fontTools.style.display = "flex";
        fontTools.appendChild(this.createSplitter());
        this.fontSizeSelector = new FontSizeDropDown(this.styleChanged)
        fontTools.appendChild(this.fontSizeSelector.Element);
        this.fontSelector = new FontDropDown(this.styleChanged);
        fontTools.appendChild(this.fontSelector.Element);
        toolsDivNd.appendChild(fontTools);
    }

    /**
     * Calback for tollbox input state change.
     *
     * @param newStyle - New style state of toolbox input.
     */
    styleChanged(newStyle: CSSObj): void {
        if (this.onStyleChange) {
            this.onStyleChange(newStyle);
        }
    }

    /**
     * Creates plitter component which can be used to separate different tools on tools panel.
     *
     * @retuns - Splitter element.
     */
    createSplitter(): HTMLDivElement {
        const div = document.createElement("div");
        div.style.width = '0px';
        div.style.height = '18px';
        div.style.margin = '2px 2px';
        div.style.display = 'inline-flex';
        div.style.border = '1px solid grey';
        div.style.borderColor = 'rgb(220,220,220)';
        return div;
    }

    /**
     * Update toolbox from style object, without firing onStateChange callback.
     *
     * @param style - New style state for toolbox inputs.
     */
    silentUpdate(style: CSSObj): void {
        const newStyle = applyOverlappingStyle(defaultStyle, style);

        const fontWeight = newStyle['font-weight'] === 'bold' ? true : false;
        const fontStyle = newStyle['font-style'] === 'italic' ? true : false;
        const underline = newStyle['text-decoration'] === 'underline' || newStyle['text-decoration-line'] === 'underline' ? true : false;
        const strikethrough = newStyle['text-decoration'] === 'line-through' || newStyle['text-decoration-line'] === 'line-through' ? true : false;

        this.boldButton.setState(fontWeight);
        this.italicButton.setState(fontStyle);
        this.underlineButton.setState(underline);
        this.strikethroughButton.setState(strikethrough);
        this.alignPanel.setStateByStyle(style);
        this.subSuperScriptPanel.setStateByStyle(style);
        this.fontSelector.setStateByStyle(style);
        this.fontSizeSelector.setStateByStyle(style);
        this.indentButton.setStateByStyle(style);
    }
}

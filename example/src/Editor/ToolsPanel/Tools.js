"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tools = void 0;
const Button_1 = require("./Inputs/Button");
const icons_1 = require("./icon/icons");
const Styling_1 = require("../Styling");
class Tools {
    onStyleChange;
    boldButton;
    italicButton;
    underlineButton;
    constructor(toolsDivNd, onStyleChange) {
        this.onStyleChange = onStyleChange;
        if (toolsDivNd) {
            toolsDivNd.innerHTML = '';
        }
        this.styleChanged = this.styleChanged.bind(this);
        this.boldButton = new Button_1.Button(icons_1.bold, { 'font-weight': 'bold' }, { 'font-weight': 'normal' }, this.styleChanged);
        this.italicButton = new Button_1.Button(icons_1.italic, { 'font-style': 'italic' }, { 'font-style': 'normal' }, this.styleChanged);
        const underlineStyle = {
            'text-decoration': 'underline',
            //'text-decoration-thickness': 'initial',
            //'text-decoration-style': 'initial',
            //'text-decoration-color': 'initial',
        };
        const decorastionOff = {
            'text-decoration': 'overline',
            //'text-decoration-thickness': 'initial',
            //text-decoration-style': 'initial',
            //'text-decoration-color': 'initial',
        };
        this.underlineButton = new Button_1.Button(icons_1.underline, { 'text-decoration': 'underline' }, { 'text-decoration': 'none' }, this.styleChanged);
        toolsDivNd?.appendChild(this.boldButton.btEl);
        toolsDivNd?.appendChild(this.italicButton.btEl);
        toolsDivNd?.appendChild(this.underlineButton.btEl);
    }
    styleChanged(newStyle) {
        if (this.onStyleChange) {
            this.onStyleChange(newStyle);
        }
    }
    // Update toolbox from style object, without firing onStateChange callback.
    silentUpdate(style) {
        const newStyle = (0, Styling_1.applyOverlappingStyle)(Styling_1.defaultStyle, style);
        const fontWeight = newStyle['font-weight'] === 'bold' ? true : false;
        const fontStyle = newStyle['font-style'] === 'italic' ? true : false;
        const underline = newStyle['text-decoration'] === 'underline' || newStyle['text-decoration-line'] === 'underline' ? true : false;
        this.boldButton.setState(fontWeight);
        this.italicButton.setState(fontStyle);
        this.underlineButton.setState(underline);
    }
}
exports.Tools = Tools;

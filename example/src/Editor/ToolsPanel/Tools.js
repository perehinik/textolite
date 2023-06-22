"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tools = void 0;
const Button_1 = require("./Inputs/Button");
const icons_1 = require("./icon/icons");
class Tools {
    onStyleChange;
    constructor(toolsDivNd, onStyleChange) {
        this.onStyleChange = onStyleChange;
        if (toolsDivNd) {
            toolsDivNd.innerHTML = '';
        }
        this.styleChanged = this.styleChanged.bind(this);
        const boldButton = new Button_1.Button(icons_1.bold, { 'font-weight': 'bold' }, { 'font-weight': 'normal' }, this.styleChanged);
        const italicButton = new Button_1.Button(icons_1.italic, { 'font-style': 'italic' }, { 'font-style': 'normal' }, this.styleChanged);
        const underlineButton = new Button_1.Button(icons_1.underline, { 'text-decoration': 'underline' }, { 'text-decoration': 'none' }, this.styleChanged);
        toolsDivNd?.appendChild(boldButton.btEl);
        toolsDivNd?.appendChild(italicButton.btEl);
        toolsDivNd?.appendChild(underlineButton.btEl);
    }
    styleChanged(newStyle) {
        if (this.onStyleChange) {
            this.onStyleChange(newStyle);
        }
    }
}
exports.Tools = Tools;

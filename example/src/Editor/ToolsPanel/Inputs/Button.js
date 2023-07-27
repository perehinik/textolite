"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
class Button {
    btImgWidth = 20;
    btImgHeight = 20;
    state = false;
    btEl;
    valueOn;
    valueOff;
    onStateChange;
    constructor(icon, valueOn, valueOff, onStateChange) {
        this.btEl = document.createElement("button");
        this.valueOn = valueOn;
        this.valueOff = valueOff;
        this.onStateChange = onStateChange;
        this.btEl.innerHTML = icon;
        this.btEl.childNodes[0].style.width = "" + this.btImgWidth;
        this.btEl.childNodes[0].style.height = "" + this.btImgHeight;
        this.btEl.style.border = "none";
        this.btEl.style.padding = "none";
        this.btEl.style.backgroundColor = "transparent";
        this.onClickHandler = this.onClickHandler.bind(this);
        // preventDefault -> prevent focus to go from text editor to button.
        this.btEl.onmousedown = (event) => { event.preventDefault(); };
        this.btEl.addEventListener("click", this.onClickHandler, false);
    }
    onClickHandler(event) {
        this.setState(!this.state);
        if (this.onStateChange) {
            this.onStateChange(this.state ? this.valueOn : this.valueOff);
        }
    }
    setState(newState) {
        this.state = newState;
        if (this.state) {
            this.btEl.style.backgroundColor = "rgba(200, 200, 200, 0.5)";
        }
        else {
            this.btEl.style.backgroundColor = "transparent";
        }
    }
    getValue() {
        return this.state ? this.valueOn : this.valueOff;
    }
}
exports.Button = Button;

/**
 * @module Button - Module contains implementation of editor tolbox button.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

/**
 * Class implements editor toolbox button functionality.
 */
export class Button{
    btImgWidth: number = 20;
    btImgHeight: number = 20;
    state: boolean = false;
    btEl: HTMLButtonElement;
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
        this.btEl = document.createElement("button");
        this.valueOn = valueOn;
        this.valueOff = valueOff;
        this.onStateChange = onStateChange;
        
        this.btEl.innerHTML = icon;
        (this.btEl.childNodes[0] as HTMLElement).style.width = "" + this.btImgWidth;
        (this.btEl.childNodes[0] as HTMLElement).style.height = "" + this.btImgHeight;
        this.btEl.style.border = "none";
        this.btEl.style.padding = "none";
        this.btEl.style.backgroundColor = "transparent";
       
        this.onClickHandler = this.onClickHandler.bind(this);
        // preventDefault -> prevent focus to go from text editor to button.
        this.btEl.onmousedown = (event) => {event.preventDefault();};
        this.btEl.addEventListener("click", this.onClickHandler, false);
    }
    
    /**
     * Calback for button state change.
     *
     * @param newStyle - New style state of toolbox input.
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
            this.btEl.style.backgroundColor = "rgba(200, 200, 200, 0.5)"
        } else {
            this.btEl.style.backgroundColor = "transparent"
        }
    }
    
    /**
     * Returns object representing current button state.
     *
     * @param newState - Object representing current button state.
     */
    getValue(): object {
        return this.state ? this.valueOn : this.valueOff;
    }
}

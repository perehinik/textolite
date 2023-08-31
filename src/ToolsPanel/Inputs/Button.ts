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
        this.Element = document.createElement("button");
        this.Element.style.display = "inline-block";
        this.valueOn = valueOn;
        this.valueOff = valueOff;
        this.onStateChange = onStateChange;
        
        this.Element.innerHTML = icon;
        (this.Element.childNodes[0] as HTMLElement).style.width = "" + this.btImgWidth;
        (this.Element.childNodes[0] as HTMLElement).style.height = "" + this.btImgHeight;
        this.Element.style.border = "none";
        this.Element.style.padding = "none";
        this.Element.style.backgroundColor = "transparent";
       
        this.onClickHandler = this.onClickHandler.bind(this);
        // preventDefault -> prevent focus to go from text editor to button.
        this.Element.onmousedown = (event) => {event.preventDefault();};
        this.Element.addEventListener("click", this.onClickHandler, false);
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

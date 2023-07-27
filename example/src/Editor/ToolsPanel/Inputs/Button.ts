export class Button{
    btImgWidth: number = 20;
    btImgHeight: number = 20;
    state: boolean = false;
    btEl: HTMLButtonElement;
    valueOn: object;
    valueOff: object;
    onStateChange: Function;

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

    onClickHandler(event: MouseEvent) {
        this.setState(!this.state);
        if (this.onStateChange) {
            this.onStateChange(this.state ? this.valueOn : this.valueOff);
        }
    }

    setState(newState: boolean) {
        this.state = newState;
        if (this.state) {
            this.btEl.style.backgroundColor = "rgba(200, 200, 200, 0.5)"
        } else {
            this.btEl.style.backgroundColor = "transparent"
        }
    }

    getValue(): object {
        return this.state ? this.valueOn : this.valueOff;
    }
}
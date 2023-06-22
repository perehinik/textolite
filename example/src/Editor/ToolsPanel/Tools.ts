import { Button } from './Inputs/Button';
import { bold, italic, underline } from './icon/icons'

export class Tools {
    onStyleChange: Function;

    constructor(toolsDivNd: HTMLDivElement, onStyleChange: Function) {
        this.onStyleChange = onStyleChange;
        if (toolsDivNd){toolsDivNd.innerHTML = '';}

        this.styleChanged = this.styleChanged.bind(this);

        const boldButton = new Button(bold, {'font-weight': 'bold'}, {'font-weight': 'normal'}, this.styleChanged);
        const italicButton = new Button(italic, {'font-style': 'italic'}, {'font-style': 'normal'}, this.styleChanged);
        const underlineButton = new Button(underline, {'text-decoration': 'underline'}, {'text-decoration': 'none'}, this.styleChanged);
        toolsDivNd?.appendChild(boldButton.btEl);
        toolsDivNd?.appendChild(italicButton.btEl);
        toolsDivNd?.appendChild(underlineButton.btEl);
    }

    styleChanged(newStyle: object) {
        if (this.onStyleChange) {
            this.onStyleChange(newStyle);
        }
    }
}
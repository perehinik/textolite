import { Button } from './Inputs/Button';
import { bold, italic, underline } from './icon/icons'
import { CSSObj, applyOverlappingStyle, defaultStyle } from '../Styling';

export class Tools {
    onStyleChange: Function;
    boldButton: Button;
    italicButton: Button;
    underlineButton: Button;

    constructor(toolsDivNd: HTMLDivElement, onStyleChange: Function) {
        this.onStyleChange = onStyleChange;
        if (toolsDivNd){toolsDivNd.innerHTML = '';}

        this.styleChanged = this.styleChanged.bind(this);

        this.boldButton = new Button(bold, {'font-weight': 'bold'}, {'font-weight': 'normal'}, this.styleChanged);
        this.italicButton = new Button(italic, {'font-style': 'italic'}, {'font-style': 'normal'}, this.styleChanged);
        // To overvrite underline you can add display: inline-block, but it will introduce ugly bug for multiline mode - don't do that :).        
        this.underlineButton = new Button(underline, {'text-decoration': 'underline'}, {'text-decoration': 'none'}, this.styleChanged);
        toolsDivNd?.appendChild(this.boldButton.btEl);
        toolsDivNd?.appendChild(this.italicButton.btEl);
        toolsDivNd?.appendChild(this.underlineButton.btEl);
    }

    styleChanged(newStyle: object) {
        if (this.onStyleChange) {
            this.onStyleChange(newStyle);
        }
    }

    // Update toolbox from style object, without firing onStateChange callback.
    silentUpdate(style: CSSObj) {
        const newStyle = applyOverlappingStyle(defaultStyle, style);

        const fontWeight = newStyle['font-weight'] === 'bold' ? true : false;
        const fontStyle = newStyle['font-style'] === 'italic' ? true : false;
        const underline = newStyle['text-decoration'] === 'underline' || newStyle['text-decoration-line'] === 'underline' ? true : false;

        this.boldButton.setState(fontWeight);
        this.italicButton.setState(fontStyle);
        this.underlineButton.setState(underline);
    }
}
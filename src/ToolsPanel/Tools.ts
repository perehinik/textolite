/**
 * @module Tools - Module contains editor toolbox implementation.
 * @author Ivan Perehiniak <iv.perehinik@gmail.com>
 */

import { Button } from './Inputs/Button';
import { bold, italic, underline } from './icon/icons'
import { CSSObj, applyOverlappingStyle, defaultStyle } from '../Styling';

/**
 * Class implements editor toolbox functionality.
 */
export class Tools {
    onStyleChange: Function;
    boldButton: Button;
    italicButton: Button;
    underlineButton: Button;
    
    /**
     * Toolbox constructor.
     *
     * @param toolsDivNd - Node that shuld be used as container for toolbox.
     * @param onStyleChange - Callback, changes style of the selected areea in editor.
     */
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

    /**
     * Calback for tollbox input state change.
     *
     * @param newStyle - New style state of toolbox input.
     */
    styleChanged(newStyle: object): void {
        if (this.onStyleChange) {
            this.onStyleChange(newStyle);
        }
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

        this.boldButton.setState(fontWeight);
        this.italicButton.setState(fontStyle);
        this.underlineButton.setState(underline);
    }
}
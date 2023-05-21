import React, { Component } from 'react';


export class ToolBox extends Component {

    constructor(props) {
        super(props);
        this.state = {  };

        this.settingsChanged = this.settingsChanged.bind(this);
    }
    
    settingsChanged() {
        if (this.props.settingsChanged) {
            this.props.settingsChanged()
        }
    }

    render() {
        return (     
            <div>
                <button onClick={this.settingsChanged}>B</button>
                <button onClick={this.settingsChanged}>I</button>
                <button onClick={this.settingsChanged}>U</button>
            </div>
        );
    }
}

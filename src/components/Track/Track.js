import React from 'react';
import './Track.css';

class Track extends React.Component {
    constructor(props) {
        super(props);
        
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
    }
    
    renderAction() {
        // Pass specific element event handler and value back to render() method based on isRemoval
        return this.props.isRemoval ?
            <a className="Track-action" onClick={this.removeTrack}>-</a> :
            <a className="Track-action" onClick={this.addTrack}>+</a>;
    }
    
    addTrack() {
        // 'Add track' event handler passes selected track model to <App />
        this.props.onAdd(this.props.track);
    }
    
    removeTrack() {
        // 'Remove track' event handler passes selected track model to <App />
        this.props.onRemove(this.props.track);
    }
    
    render() {
        return (
            <div className="Track">
                <div className="Track-information">
                    <h3>{this.props.track.name}</h3>
                    <p>{this.props.track.artist} | {this.props.track.album}</p>
                </div>
                
                {/* Display + or - depending on configuration from parent's parent container <SearchResults /> or <Playlist /> */}
                {this.renderAction()}
            </div>
        );
    }
}

export default Track;

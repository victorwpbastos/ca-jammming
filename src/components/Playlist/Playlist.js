import React from 'react';
import TrackList from '../TrackList/TrackList';
import './Playlist.css';

class Playlist extends React.Component {
    constructor(props) {
        super(props);
        
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }
    
    handleNameChange(event) {
        // Call parent component method with search string to update parent state (because <App /> talks to Spotify using its state)
        this.props.onNameChange(event.target.value);
    }
    
    handleSave() {
        // Again, Spotify API requests go through the <App /> component, so pass it up
        this.props.onSave();
    }
    
    render() {
        return (
            <div className="Playlist">
                <input defaultValue={this.props.playlistName} onChange={this.handleNameChange}/>
                <TrackList trackList={this.props.playlistTracks} isRemoval={true} onRemove={this.props.onRemove}/>
                <a className="Playlist-save" onClick={this.handleSave}>SAVE TO SPOTIFY</a>
            </div>
        );
    }
}

export default Playlist;

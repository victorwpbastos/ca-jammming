import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify.js';

import './App.css';


class App extends React.Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
            searchResults : [],              // Results from Spotify API calls
            playlistName  : "New Playlist",  // Name of Playlist for sending to Spotify API
            playlistTracks: []               // Array of Tracks in Playlist
        };
        
        // Event handler 'this' bindings for all interactions
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.updatePlaylistName = this.updatePlaylistName.bind(this);
        this.savePlaylist = this.savePlaylist.bind(this);
        this.search = this.search.bind(this);
    }
    
    addTrack(trackToAdd) {
        // If the track does not already exist in the playlistTracks array, add it in there
        // Iterate over track.ids and proceed if no match
        if (!this.state.playlistTracks.some(track => track.id === trackToAdd.id)) {
            this.setState({playlistTracks: [...this.state.playlistTracks, trackToAdd]}); // Fancy spread operator!
        }
    }
    
    removeTrack(trackToRemove) {
        // Filter track out of playlist using id
        let newArray = this.state.playlistTracks.filter((track) => track.id !== trackToRemove.id);
        this.setState({playlistTracks: newArray});
    }
    
    updatePlaylistName(newName) {
        // Pass newName (from event.target.value) to this.state.
        this.setState({playlistName: newName});
    }
    
    savePlaylist() {
        // Make new array containing only track URIs for Spotify API
        let trackURIs = this.state.playlistTracks.map(track => track.uri);
        
        // Call Spotify API wrapper with playlist name and track URIs array
        Spotify.savePlaylist(this.state.playlistName, trackURIs);
        
        // Reset SearchResults and Playlist name
        this.setState({
            playlistName : "New Playlist",
            searchResults: []
        })
    }
    
    search(term) {
        // Call Spotify API wrapper and get array of Track model objects
        Spotify.search(term).then(searchResults => {
            // Re-render <SearchResults /> on receiving new list
            this.setState({searchResults: searchResults});
        });
    }
    
    render() {
        return (
            <div>
                <h1>Ja<span className="highlight">mmm</span>ing</h1>
                <div className="App">
                    <SearchBar onSearch={this.search}/>
                    <div className="App-playlist">
                        <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack}/>
                        <Playlist playlistTracks={this.state.playlistTracks}
                                  playlistName={this.state.playlistName}
                                  onRemove={this.removeTrack}
                                  onNameChange={this.updatePlaylistName}
                                  onSave={this.savePlaylist}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

import React from 'react';
import TrackList from '../TrackList/TrackList';
import './SearchResults.css';

class SearchResults extends React.Component {
    render() {
        return (
            <div className="SearchResults">
                <h2>Results ({this.props.searchResults.length})</h2>
                <TrackList trackList={this.props.searchResults} isRemoval={false} onAdd={this.props.onAdd}/>
            </div>
        );
    }
}

export default SearchResults;

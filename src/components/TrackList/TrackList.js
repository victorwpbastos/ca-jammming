import React from 'react';
import Track from '../Track/Track';
import './TrackList.css';

class TrackList extends React.Component {
    render() {
        return (
            <div className="TrackList">
                {
                    this.props.trackList.map(track => <Track track={track} isRemoval={this.props.isRemoval}
                                                             onAdd={this.props.onAdd} onRemove={this.props.onRemove}
                                                             key={track.id}/>)
                }
            </div>
        );
    }
}

export default TrackList;

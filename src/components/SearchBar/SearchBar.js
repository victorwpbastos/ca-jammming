import React from 'react';

import './SearchBar.css';

class SearchBar extends React.Component {
     constructor (props) {
          super(props);

          this.state = {
               term: ''
          }

          this.search = this.search.bind(this);
          this.handleTermChange = this.handleTermChange.bind(this);
     }

     search () {
          // When search button is clicked call parent component with search string
          this.props.onSearch(this.state.term);
     }

     handleTermChange (event) {
          // Each time value on input element changes, update this.state
          this.setState({term: event.target.value});
     }

    render () {
        return (
            <div className="SearchBar">
                 <input placeholder="Enter A Song Title" onChange={this.handleTermChange} />
                 <a onClick={this.search}>SEARCH</a>
            </div>
        );
    }
}

export default SearchBar;

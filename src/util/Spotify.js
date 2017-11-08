const clientId = '77db7677a3524f579de3e85294bf43c4';
//const clientSecret = 'dafd986f868e46c9a4dabb02d5f176b5';
// const redirectUri = 'https://elight81-jammming.surge.sh/';
const redirectUri = 'http://localhost:3000/';

class AccessTokenObject {
    constructor(hash) {
        if (hash.access_token && hash.expires_in) {
            this._token = hash.access_token;
            this._expiryTime = Date.now() + parseInt(hash.expires_in) * 1000;
        } else {
            this._token = null;
            this._expiryTime = null;
        }
    }

    get token() {
        return this._token; // Adding a comment
    }

    get isExpired() {
        if (this._expiryTime)
            return Date.now() > this._expiryTime;
        else
            return true;
    }

    get isValid() {
        return (this._token && !this.isExpired);
    }
};

const parseQuery = (queryString) => { //SO snippet from Raivo Fishmeister
    if (queryString[0] === '#') queryString = queryString.replace('#', ''); // But I had to add this line
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

let tokenObject = {};

const Spotify = {

    getAccessToken: function () {
        if (tokenObject.isValid) {
            // Valid token in object
            return new Promise(resolve => resolve(tokenObject));
        } else {
            // Invalid token in object, get from URL
            tokenObject = new AccessTokenObject(parseQuery(window.location.hash));

            // Clear url from browser address bar
            window.history.pushState('Access Token', null, '/');

            // If token in object is now valid
            if (tokenObject.isValid) {
                return new Promise(resolve => resolve(tokenObject));
            } else {
                // If not, redirect to auth endpoint
                let scopes = 'playlist-modify-public playlist-modify-private';
                window.location.replace('https://accounts.spotify.com/authorize?response_type=token&redirect_uri=' + encodeURIComponent(redirectUri) + '&client_id=' + clientId + '&scope=' + encodeURIComponent(scopes));

                return Promise.reject('Redirected'); // TODO - This isn't working
            }
        }
    },

    search: function (term) {
        return Spotify.getAccessToken().then(tokenObject => {
            return fetch('https://api.spotify.com/v1/search?type=track&q=' + term, {
                method : 'GET',
                headers: {
                    "Authorization": "Bearer " + tokenObject.token
                }
            }).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error("Request failed. " + response.status);
                }, networkError => alert("Network Error: " + networkError.message)
            ).then(jsonResponse => {
                return jsonResponse.tracks.items.map(item => {
                    return {
                        id    : item.id,
                        name  : item.name,
                        artist: item.artists[0].name,
                        album : item.album.name,
                        uri   : item.uri
                    }
                });
            });
        });
    },

    savePlaylist: function (playlistName, trackURIs) {
         // As per instructions in the assessment
         if (!playlistName || !trackURIs) return;

         return Spotify.getAccessToken().then(tokenObject => {
             return fetch('https://api.spotify.com/v1/me', {
                method : 'GET',
                headers: {
                     "Authorization": 'Bearer ' + tokenObject.token,
                    "Content-Type" : "application/json"
                }
            }).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error("Request failed. " + response.status);
                }, networkError => alert("Network error: " + networkError.message)
            ).then(jsonResponse => { // Got the user ID
                return jsonResponse.id
            }).then(userId => {
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                    method : 'POST',
                    headers: {
                        "Authorization": "Bearer " + tokenObject.token
                    },
                    body   : JSON.stringify({
                        name  : playlistName,
                        public: false
                    })
                }).then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                    }, networkError => alert("Network error: " + networkError.status)
                ).then(jsonResponse => { // Got the playlist ID
                    let playlistId = jsonResponse.id;

                    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                        method : 'POST',
                        headers: {
                            "Authorization": "Bearer " + tokenObject.token,
                            "Content-Type" : "application/json"
                        },
                        body   : JSON.stringify({uris: trackURIs})
                    }).then(response => {
                        if (response.ok) {
                            return response;
                        }
                        throw new Error("Request failed. " + response.status);
                    })
                })
            });
        });
    }
};

export default Spotify;

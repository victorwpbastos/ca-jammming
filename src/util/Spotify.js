const clientId = '77db7677a3524f579de3e85294bf43c4';
const redirectUri = 'http://localhost:3000/'; // 'https://elight81-jammming.surge.sh/';

class AccessTokenObject {
    constructor(hash) {
        // Determine if url taken from address bar contains valid query string fields
        if (hash.access_token && hash.expires_in) {
            
            // Store / compute
            this._token = hash.access_token;
            
            // Instead of a setTimeout call, compute the time at which the token expires and then compare current time to that prior to each API call
            this._expiryTime = Date.now() + parseInt(hash.expires_in, 10) * 1000; // Radix param???
        } else {
            // Nullify
            this._token = null;
            this._expiryTime = null;
        }
    }
    
    get isExpired() {
        // If this object has an expiry_time key, use it for the conditional
        if (this._expiryTime)
            return Date.now() > this._expiryTime;
        // If not, just assume it's expired
        else
            return true;
    }
    
    get isValid() {
        // Valid: we have a token and it has not expired yet
        return (this._token && !this.isExpired);
    }
    
    get token() {
        // Only return a valid token or undefined through this getter
        return this.isValid ? this._token : undefined;
    }
    
}

const parseQuery = (queryString) => { //SO snippet from Raivo Fishmeister
    if (queryString[0] === '#') queryString = queryString.replace('#', ''); // But I had to add this line
    let query = {};
    let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
};

let tokenObject = {};

const Spotify = {
    
    getAccessToken: function () {
        // Do we have a valid token already?
        if (tokenObject.token) {
            // Yes!
            return new Promise(resolve => resolve(tokenObject));
        } else {
            // No! Make another one from URL
            tokenObject = new AccessTokenObject(parseQuery(window.location.hash));
            
            // Clear url from browser address bar so we don't try to grab it after expiry
            window.history.pushState('Access Token', '', '/');
            
            // If token in object is now valid
            if (tokenObject.token) {
                return new Promise(resolve => resolve(tokenObject));
            } else {
                // If not, redirect to auth endpoint
                let scopes = 'playlist-modify-public playlist-modify-private';
                window.location.replace('https://accounts.spotify.com/authorize?response_type=token&redirect_uri=' + encodeURIComponent(redirectUri) + '&client_id=' + clientId + '&scope=' + encodeURIComponent(scopes));
                
                return Promise.reject('Token invalid. Redirecting');
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
        }, reason => alert(reason) // Let user know before they get redirected? Is that helpful at all?
        );
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

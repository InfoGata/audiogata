import axios from 'axios';

export interface ISoundCloudResult {

}

class SoundCloud {
    public clientId = 'NmW1FlPaiL94ueEu7oziOWjYEzZzQDcK';
    public searchTracks(query: string) {
        const path = 'http://api.soundcloud.com/tracks';
        const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(query)}`;
        axios.get(url)
            .then(response => console.log(response));
    }
}

export default SoundCloud;
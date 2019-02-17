import axios from 'axios';

class SoundCloud {
    public clientId = 'LvWovRaJZlWCHql0bISuum8Bd2KX79mb';
    public searchTracks(query: string) {
        const path = 'http://api.soundcloud.com/tracks';
        const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(query)}`;
        axios.get(url)
            .then(response => console.log(response));
    }
}

export default SoundCloud;
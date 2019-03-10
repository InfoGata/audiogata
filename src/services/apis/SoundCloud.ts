import axios from 'axios';
import { ISong } from '../data/database';

export interface ISoundCloudResult {
  title: string;
  stream_url: string;
}

class SoundCloud {
  private clientId = 'NmW1FlPaiL94ueEu7oziOWjYEzZzQDcK';

  async searchTracks(query: string) {
    const path = 'http://api.soundcloud.com/tracks';
    const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(query)}`;
    let results = await axios.get<ISoundCloudResult[]>(url);
    return this.SoundCloudResultToSongInfo(results.data);
  }

  getTrackUrl(song: ISong) {
    return `${song.source}?client_id=${this.clientId}`;
  }

  private SoundCloudResultToSongInfo(results: ISoundCloudResult[]) : ISong[] {
    return results.map(r => <ISong> {
        name: r.title,
        source: r.stream_url,
        useBlob: false,
        from: 'soundcloud'
      });
  }

}

export default SoundCloud;

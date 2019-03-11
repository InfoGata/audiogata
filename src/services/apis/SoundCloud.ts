import axios from 'axios';
import { ISong, IAlbum, IArtist } from '../data/database';

interface ISoundCloudTrackResult {
  title: string;
  stream_url: string;
}

interface ISoundCloudArtistResult {
  id: number;
  username: string;
}

interface ISoundCloudPlaylistResult {
  id: number;
  user: ISoundCloudArtistResult;
  title: string;
}

class SoundCloud {
  private readonly clientId = 'NmW1FlPaiL94ueEu7oziOWjYEzZzQDcK';
  private readonly apiPath = 'http://api.soundcloud.com'

  async searchTracks(query: string): Promise<ISong[]> {
    const path = `${this.apiPath}/tracks`;
    const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(query)}`;
    let results = await axios.get<ISoundCloudTrackResult[]>(url);
    return this.songResultToSong(results.data);
  }

  getTrackUrl(song: ISong): string {
    return `${song.source}?client_id=${this.clientId}`;
  }

  async searchArtists(query: string): Promise<IArtist[]> {
    const path = `${this.apiPath}/users`;
    const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(query)}`;
    let results = await axios.get<ISoundCloudArtistResult[]>(url);
    return this.aristResultToArtist(results.data);
  }

  async searchAlbums(query: string): Promise<IAlbum[]> {
    const path = `${this.apiPath}/playlists`;
    const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(query)}`;
    let results = await axios.get<ISoundCloudPlaylistResult[]>(url);
    return this.playlistResultToAlbum(results.data);
  }

  async getAlbumTracks(album: IAlbum): Promise<ISong[]> {
    const path = `${this.apiPath}/playlists/${album.apiId}/tracks`;
    const url = `${path}?client_id=${this.clientId}`;
    let results = await axios.get<ISoundCloudTrackResult[]>(url);
    return this.songResultToSong(results.data);
  }

  async getArtistAlbums(artist: IArtist): Promise<IArtist[]> {
    const path = `${this.apiPath}/users/${artist.apiId}/playlists`;
    const url = `${path}?client_id=${this.clientId}`;
    let results = await axios.get<ISoundCloudPlaylistResult[]>(url);
    return this.playlistResultToAlbum(results.data);
  }

  private songResultToSong(results: ISoundCloudTrackResult[]): ISong[] {
    return results.map(r => <ISong> {
        name: r.title,
        source: r.stream_url,
        useBlob: false,
        from: 'soundcloud'
      });
  }

  private aristResultToArtist(results: ISoundCloudArtistResult[]): IArtist[] {
    return results.map(r => <IArtist> {
        name: r.username,
        apiId: r.id.toString(),
        from: 'soundcloud'
      });
  }

  private playlistResultToAlbum(results: ISoundCloudPlaylistResult[]): IAlbum[] {
    return results.map(r => <IAlbum> {
        name: r.title,
        apiId: r.id.toString(),
        from: 'soundcloud'
      });
  }
}

export default SoundCloud;

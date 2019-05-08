import axios from "axios";
import { IAlbum, IArtist, ISong } from "../data/database";
import { ISearchApi } from "./ISearchApi";

interface ISoundCloudTrackResult {
  title: string;
  stream_url: string;
  id: number;
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

class SoundCloud implements ISearchApi {
  private readonly clientId = "NmW1FlPaiL94ueEu7oziOWjYEzZzQDcK";
  private readonly apiPath = "http://api.soundcloud.com";

  public async searchAll(query: string) {
    const [tracks, albums, artists] = await Promise.all([
      this.searchTracks(query),
      this.searchAlbums(query),
      this.searchArtists(query),
    ]);
    return { tracks, albums, artists };
  }

  public async searchTracks(query: string): Promise<ISong[]> {
    const path = `${this.apiPath}/tracks`;
    const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(
      query,
    )}`;
    const results = await axios.get<ISoundCloudTrackResult[]>(url);
    return this.songResultToSong(results.data);
  }

  public getTrackUrl(song: ISong): string {
    return `${song.source}?client_id=${this.clientId}`;
  }

  public async searchArtists(query: string): Promise<IArtist[]> {
    const path = `${this.apiPath}/users`;
    const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(
      query,
    )}`;
    const results = await axios.get<ISoundCloudArtistResult[]>(url);
    return this.aristResultToArtist(results.data);
  }

  public async searchAlbums(query: string): Promise<IAlbum[]> {
    const path = `${this.apiPath}/playlists`;
    const url = `${path}?client_id=${this.clientId}&q=${encodeURIComponent(
      query,
    )}`;
    const results = await axios.get<ISoundCloudPlaylistResult[]>(url);
    return this.playlistResultToAlbum(results.data);
  }

  public async getAlbumTracks(album: IAlbum): Promise<ISong[]> {
    const path = `${this.apiPath}/playlists/${album.apiId}/tracks`;
    const url = `${path}?client_id=${this.clientId}`;
    const results = await axios.get<ISoundCloudTrackResult[]>(url);
    return this.songResultToSong(results.data);
  }

  public async getArtistAlbums(artist: IArtist): Promise<IArtist[]> {
    const path = `${this.apiPath}/users/${artist.apiId}/playlists`;
    const url = `${path}?client_id=${this.clientId}`;
    const results = await axios.get<ISoundCloudPlaylistResult[]>(url);
    return this.playlistResultToAlbum(results.data);
  }

  private songResultToSong(results: ISoundCloudTrackResult[]): ISong[] {
    return results.map(
      r =>
        ({
          apiId: r.id.toString(),
          from: "soundcloud",
          name: r.title,
          source: r.stream_url,
          useBlob: false,
        } as ISong),
    );
  }

  private aristResultToArtist(results: ISoundCloudArtistResult[]): IArtist[] {
    return results.map(
      r =>
        ({
          apiId: r.id.toString(),
          from: "soundcloud",
          name: r.username,
        } as IArtist),
    );
  }

  private playlistResultToAlbum(
    results: ISoundCloudPlaylistResult[],
  ): IAlbum[] {
    return results.map(
      r =>
        ({
          apiId: r.id.toString(),
          from: "soundcloud",
          name: r.title,
        } as IAlbum),
    );
  }
}

export default SoundCloud;

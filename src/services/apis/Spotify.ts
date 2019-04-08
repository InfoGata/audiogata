import axios from "axios";
import { IAlbum, IArtist, ISong } from "../data/database";
import { AuthService } from "../data/auth.service";

interface ISpotifyResult {
  albums: ISpotifyAlbumResult;
  artists: ISpotifyArtistResult;
  tracks: ISpotifyTrackResult;
}

interface ISpotifyAlbumResult {
  items: ISpotifyAlbum[];
}

interface ISpotifyAlbum {
  name: string;
  uri: string;
}

interface ISpotifyArtistResult {
  items: ISpotifyArtist[];
}

interface ISpotifyArtist {
  name: string;
  uri: string;
}

interface ISpotifyTrackResult {
  items: ISpotifyTrack[];
}

interface ISpotifyTrack {
  name: string;
  uri: string;
}
class Spotify {
  private readonly authService = new AuthService();
  private readonly apiUrl = "https://api.spotify.com/v1";
  public async searchAll(query: string) {
    const auth = await this.authService.getAuthByName("spotify");
    if (!auth) {
      return { tracks: [], albums: [], artists: [] };
    }
    const url = `${this.apiUrl}/search?q=${encodeURIComponent(
      query,
    )}&type=album,artist,track`;
    const results = await axios.get<ISpotifyResult>(url, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    const data = results.data;
    const tracks = this.trackResultToSong(data.tracks.items);
    const albums = this.albumResultToAlbum(data.albums.items);
    const artists = this.artistResultToArtist(data.artists.items);
    return { tracks, albums, artists };
  }

  private trackResultToSong(results: ISpotifyTrack[]): ISong[] {
    return results.map(
      r =>
        ({
          apiId: r.uri,
          from: "spotify",
          name: r.name,
          useBlob: false,
        } as ISong),
    );
  }

  private artistResultToArtist(results: ISpotifyArtist[]): IArtist[] {
    return results.map(
      r =>
        ({
          apiId: r.uri,
          from: "napster",
          name: r.name,
        } as IArtist),
    );
  }

  private albumResultToAlbum(results: ISpotifyAlbum[]): IAlbum[] {
    return results.map(
      r =>
        ({
          apiId: r.uri,
          from: "napster",
          name: r.name,
        } as IAlbum),
    );
  }
}

export default Spotify;

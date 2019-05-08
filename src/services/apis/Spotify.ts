import axios from "axios";
import { AuthService } from "../data/auth.service";
import { IAlbum, IArtist, ISong } from "../data/database";
import { ISearchApi } from "./ISearchApi";

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
class Spotify implements ISearchApi {
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

  public async getAlbumTracks(album: IAlbum) {
    const auth = await this.authService.getAuthByName("spotify");
    if (!auth) {
      return [];
    }
    const id = album.apiId.split(":").pop();
    const url = `${this.apiUrl}/albums/${id}/tracks?limit=50`;
    const results = await axios.get<ISpotifyTrackResult>(url, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    return this.trackResultToSong(results.data.items);
  }

  public async getArtistAlbums(artist: IArtist) {
    const auth = await this.authService.getAuthByName("spotify");
    if (!auth) {
      return [];
    }
    const id = artist.apiId.split(":").pop();
    const url = `${this.apiUrl}/artists/${id}/albums`;
    const results = await axios.get<ISpotifyAlbumResult>(url, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    return this.albumResultToAlbum(results.data.items);
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
          from: "spotify",
          name: r.name,
        } as IArtist),
    );
  }

  private albumResultToAlbum(results: ISpotifyAlbum[]): IAlbum[] {
    return results.map(
      r =>
        ({
          apiId: r.uri,
          from: "spotify",
          name: r.name,
        } as IAlbum),
    );
  }
}

export default Spotify;

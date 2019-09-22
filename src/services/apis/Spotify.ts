import axios from "axios";
import { IAlbum, IArtist, ISong } from "../../models";
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
  artists: ISpotifyArtist[];
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
  duration_ms: number;
  album: ISpotifyAlbum;
  artists: ISpotifyArtist[];
}

const apiUrl = "https://api.spotify.com/v1";
let accessToken: string = "";
function trackResultToSong(results: ISpotifyTrack[]): ISong[] {
  return results.map(
    r =>
      ({
        albumId: r.album && r.album.uri,
        apiId: r.uri,
        artistId: r.artists[0].uri,
        artistName: r.artists[0].name,
        duration: r.duration_ms / 1000,
        from: "spotify",
        name: r.name,
        useBlob: false,
      } as ISong),
  );
}

function artistResultToArtist(results: ISpotifyArtist[]): IArtist[] {
  return results.map(
    r =>
      ({
        apiId: r.uri,
        from: "spotify",
        name: r.name,
      } as IArtist),
  );
}

function albumResultToAlbum(results: ISpotifyAlbum[]): IAlbum[] {
  return results.map(
    r =>
      ({
        apiId: r.uri,
        artistId: r.artists[0].uri,
        artistName: r.artists[0].name,
        from: "spotify",
        name: r.name,
      } as IAlbum),
  );
}

export default {
  setAuth(token: string) {
    accessToken = token;
  },
  async searchAll(query: string) {
    if (!accessToken) {
      return { tracks: [], albums: [], artists: [] };
    }
    const url = `${apiUrl}/search?q=${encodeURIComponent(
      query,
    )}&type=album,artist,track`;
    const results = await axios.get<ISpotifyResult>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = results.data;
    const tracks = trackResultToSong(data.tracks.items);
    const albums = albumResultToAlbum(data.albums.items);
    const artists = artistResultToArtist(data.artists.items);
    return { tracks, albums, artists };
  },
  async getAlbumTracks(album: IAlbum) {
    if (!accessToken) {
      return [];
    }
    const id = album.apiId.split(":").pop();
    const url = `${apiUrl}/albums/${id}/tracks?limit=50`;
    const results = await axios.get<ISpotifyTrackResult>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const tracks = trackResultToSong(results.data.items);
    tracks.forEach(t => {
      t.albumId = album.apiId;
    })
    return tracks;
  },
  async getArtistAlbums(artist: IArtist) {
    if (!accessToken) {
      return [];
    }
    const id = artist.apiId.split(":").pop();
    const url = `${apiUrl}/artists/${id}/albums`;
    const results = await axios.get<ISpotifyAlbumResult>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return albumResultToAlbum(results.data.items);
  }
} as ISearchApi;

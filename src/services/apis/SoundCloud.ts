import axios from "axios";
import { IAlbum, IArtist, ISong } from "../../models";
import { IFormatTrackApi } from "./IFormatTrackApi";
import { ISearchApi } from "./ISearchApi";

interface ISoundCloudTrackResult {
  title: string;
  stream_url: string;
  id: number;
  duration: number;
  user: ISoundCloudArtistResult;
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

const clientId = "NmW1FlPaiL94ueEu7oziOWjYEzZzQDcK";
const apiPath = "http://api.soundcloud.com";

function songResultToSong(results: ISoundCloudTrackResult[]): ISong[] {
  return results.map(
    r =>
      ({
        apiId: r.id.toString(),
        artistId: r.user.id.toString(),
        artistName: r.user.username,
        duration: r.duration / 1000,
        from: "soundcloud",
        name: r.title,
        source: r.stream_url,
        useBlob: false,
      } as ISong),
  );
}

async function searchArtists(query: string): Promise<IArtist[]> {
  const path = `${apiPath}/users`;
  const url = `${path}?client_id=${clientId}&q=${encodeURIComponent(
    query,
  )}`;
  const results = await axios.get<ISoundCloudArtistResult[]>(url);
  return artistResultToArtist(results.data);
}

async function searchAlbums(query: string): Promise<IAlbum[]> {
  const path = `${apiPath}/playlists`;
  const url = `${path}?client_id=${clientId}&q=${encodeURIComponent(
    query,
  )}`;
  const results = await axios.get<ISoundCloudPlaylistResult[]>(url);
  return playlistResultToAlbum(results.data);
}

async function searchTracks(query: string): Promise<ISong[]> {
  const path = `${apiPath}/tracks`;
  const url = `${path}?client_id=${clientId}&q=${encodeURIComponent(
    query,
  )}`;
  const results = await axios.get<ISoundCloudTrackResult[]>(url);
  return songResultToSong(results.data);
}

function artistResultToArtist(results: ISoundCloudArtistResult[]): IArtist[] {
  return results.map(
    r =>
      ({
        apiId: r.id.toString(),
        from: "soundcloud",
        name: r.username,
      } as IArtist),
  );
}

function playlistResultToAlbum(
  results: ISoundCloudPlaylistResult[],
): IAlbum[] {
  return results.map(
    r =>
      ({
        apiId: r.id.toString(),
        artistId: r.user.id.toString(),
        artistName: r.user.username,
        from: "soundcloud",
        name: r.title,
      } as IAlbum),
  );
}

export default {
  async searchAll(query: string) {
    const [tracks, albums, artists] = await Promise.all([
      searchTracks(query),
      searchAlbums(query),
      searchArtists(query),
    ]);
    return { tracks, albums, artists };
  },
  getTrackUrl(song: ISong) {
    return Promise.resolve(`${song.source}?client_id=${clientId}`);
  },
  async getAlbumTracks(album: IAlbum): Promise<ISong[]> {
    const path = `${apiPath}/playlists/${album.apiId}/tracks`;
    const url = `${path}?client_id=${clientId}`;
    const results = await axios.get<ISoundCloudTrackResult[]>(url);
    return songResultToSong(results.data);
  },
  async getArtistAlbums(artist: IArtist): Promise<IArtist[]> {
    const path = `${apiPath}/users/${artist.apiId}/playlists`;
    const url = `${path}?client_id=${clientId}`;
    const results = await axios.get<ISoundCloudPlaylistResult[]>(url);
    return playlistResultToAlbum(results.data);
  }
} as ISearchApi & IFormatTrackApi

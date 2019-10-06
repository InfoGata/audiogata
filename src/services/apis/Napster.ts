import axios from "axios";
import { IAlbum, IArtist, ISong, IImage } from "../../models";
import { ISearchApi } from "./ISearchApi";

interface INapsterResult {
  search: INapsterSearch;
}

interface INapsterSearch {
  data: INapsterData;
}

interface INapsterData {
  artists: INapsterArtist[];
  albums: INapsterAlbum[];
  tracks: INapsterTrack[];
}

interface INapsterArtist {
  id: string;
  name: string;
}

interface INapsterAlbum {
  id: string;
  name: string;
  artistName: string;
  contributingArtists: IContributingArtists;
}

interface IContributingArtists {
  primaryArtist: string;
}

interface INapsterTrack {
  id: string;
  name: string;
  playbackSeconds: number;
  albumId: string;
  artistId: string;
  artistName: string;
}

const apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
const path = "https://api.napster.com/v2.2";

async function searchTracks(query: string) {
  const url = `${path}/search?apikey=${
    apiKey
    }&query=${encodeURIComponent(query)}&type=track`;
  try {
    const results = await axios.get<INapsterResult>(url);
    const tracks = results.data.search.data.tracks;
    return trackResultToSong(tracks);
  } catch {
    return [];
  }
}

async function searchArtists(query: string) {
  const url = `${path}/search?apikey=${
    apiKey
    }&query=${encodeURIComponent(query)}&type=artist`;
  try {
    const results = await axios.get<INapsterResult>(url);
    const artists = results.data.search.data.artists;
    return aristResultToArtist(artists);
  } catch {
    return [];
  }
}

async function searchAlbums(query: string) {
  const url = `${path}/search?apikey=${
    apiKey
    }&query=${encodeURIComponent(query)}&type=album`;
  try {
    const results = await axios.get<INapsterResult>(url);
    const albums = results.data.search.data.albums;
    return albumResultToAlbum(albums);
  } catch {
    return [];
  }
}

function albumResultToAlbum(results: INapsterAlbum[]): IAlbum[] {
  return results.map(
    r =>
      ({
        apiId: r.id.toString(),
        artistId: r.contributingArtists.primaryArtist,
        artistName: r.artistName,
        from: "napster",
        name: r.name,
      } as IAlbum),
  );
}

function aristResultToArtist(results: INapsterArtist[]): IArtist[] {
  return results.map(
    r =>
      ({
        apiId: r.id.toString(),
        from: "napster",
        name: r.name,
      } as IArtist),
  );
}

function getImages(albumId: string): IImage[] {
  const sizes = [70, 170, 200, 300, 500];
  return sizes.map(s => ({
    height: s,
    url: `https://api.napster.com/imageserver/v2/albums/${albumId}/images/${s}x${s}.jpg`,
    width: s
  }));
}

function trackResultToSong(results: INapsterTrack[]): ISong[] {
  return results.map(
    r =>
      ({
        albumId: r.albumId,
        apiId: r.id,
        artistId: r.artistId,
        artistName: r.artistName,
        duration: r.playbackSeconds,
        from: "napster",
        images: getImages(r.albumId),
        name: r.name,
      } as ISong),
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
  async getAlbumTracks(album: IAlbum) {
    const url = `${path}/albums/${album.apiId}/tracks?apikey=${
      apiKey
      }`;
    try {
      const results = await axios.get<INapsterData>(url);
      const tracks = results.data.tracks;
      return trackResultToSong(tracks);
    } catch {
      return [];
    }
  },
  async getArtistAlbums(artist: IArtist) {
    const url = `${path}/artists/${artist.apiId}/albums/top?apikey=${
      apiKey
      }`;
    try {
      const results = await axios.get<INapsterData>(url);
      const albums = results.data.albums;
      return albumResultToAlbum(albums);
    } catch {
      return [];
    }
  }
} as ISearchApi

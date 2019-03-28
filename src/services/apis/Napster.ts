import axios from "axios";
import { IAlbum, IArtist, ISong } from "../data/database";

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
}

interface INapsterTrack {
  id: string;
  name: string;
}

class Napster {
  private readonly apiKey = "N2Q4YzVkYzctNjBiMi00YjBhLTkxNTAtOWRiNGM5YWE3OWRj";
  private readonly path = "https://api.napster.com/v2.2";

  public async searchTracks(query: string) {
    const url = `${this.path}/search?apikey=${
      this.apiKey
    }&query=${encodeURIComponent(query)}&type=track`;
    try {
      const results = await axios.get<INapsterResult>(url);
      const tracks = results.data.search.data.tracks;
      return this.trackResultToSong(tracks);
    } catch {
      return [];
    }
  }

  public async searchArtists(query: string) {
    const url = `${this.path}/search?apikey=${
      this.apiKey
    }&query=${encodeURIComponent(query)}&type=artist`;
    try {
      const results = await axios.get<INapsterResult>(url);
      const artists = results.data.search.data.artists;
      return this.aristResultToArtist(artists);
    } catch {
      return [];
    }
  }

  public async searchAlbums(query: string) {
    const url = `${this.path}/search?apikey=${
      this.apiKey
    }&query=${encodeURIComponent(query)}&type=album`;
    try {
      const results = await axios.get<INapsterResult>(url);
      const albums = results.data.search.data.albums;
      return this.albumResultToAlbum(albums);
    } catch {
      return [];
    }
  }

  public async getAlbumTracks(album: IAlbum) {
    const url = `${this.path}/albums/${album.apiId}/tracks?apikey=${
      this.apiKey
    }`;
    try {
      const results = await axios.get<INapsterData>(url);
      const tracks = results.data.tracks;
      return this.trackResultToSong(tracks);
    } catch {
      return [];
    }
  }

  public async getArtistAlbums(artist: IArtist) {
    const url = `${this.path}/artists/${artist.apiId}/albums/top?apikey=${
      this.apiKey
    }`;
    try {
      const results = await axios.get<INapsterData>(url);
      const albums = results.data.albums;
      return this.albumResultToAlbum(albums);
    } catch {
      return [];
    }
  }

  private trackResultToSong(results: INapsterTrack[]): ISong[] {
    return results.map(
      r =>
        ({
          apiId: r.id,
          from: "napster",
          name: r.name,
          useBlob: false,
        } as ISong),
    );
  }

  private aristResultToArtist(results: INapsterArtist[]): IArtist[] {
    return results.map(
      r =>
        ({
          apiId: r.id.toString(),
          from: "napster",
          name: r.name,
        } as IArtist),
    );
  }

  private albumResultToAlbum(results: INapsterAlbum[]): IAlbum[] {
    return results.map(
      r =>
        ({
          apiId: r.id.toString(),
          from: "napster",
          name: r.name,
        } as IAlbum),
    );
  }
}

export default Napster;

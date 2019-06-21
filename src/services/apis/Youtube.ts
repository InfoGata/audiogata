import axios from "axios";
import { IAlbum, IArtist, ISong } from "../data/database";
import { IFormatTrackApi } from "./IFormatTrackApi";
import { ISearchApi } from "./ISearchApi";

interface IInvidiousVideoResult {
  title: string;
  videoId: string;
  lengthSeconds: number;
}

interface IInvidiousVideoResponse {
  adaptiveFormats: IInvidiousFormat[];
}

interface IInvidiousFormat {
  itag: string;
  url: string;
}

function resultToSong(results: IInvidiousVideoResult[]): ISong[] {
  return results.map(
    r =>
      ({
        apiId: r.videoId,
        duration: r.lengthSeconds,
        from: "youtube",
        name: r.title,
      } as ISong),
  );
}

async function searchTracks(query: string): Promise<ISong[]> {
  const url = `https://invidio.us/api/v1/search?q=${encodeURIComponent(query)}`;
  const results = await axios.get<IInvidiousVideoResult[]>(url);
  return resultToSong(results.data);
}

export default {
  async getAlbumTracks(album: IAlbum) {
    return [];
  },
  async getArtistAlbums(artist: IArtist) {
    return [];
  },
  async searchAll(query: string) {
    return {
      albums: [],
      artists: [],
      tracks: await searchTracks(query),
    };
  },
  async getTrackUrl(song: ISong): Promise<string> {
    const url = `https://invidio.us/api/v1/videos/${song.apiId}`;
    const results = await axios.get<IInvidiousVideoResponse>(url);
    const formats = results.data.adaptiveFormats;
    const audioFormat = formats.filter(f => f.itag === "140")[0];
    return audioFormat.url;
  }
} as IFormatTrackApi & ISearchApi

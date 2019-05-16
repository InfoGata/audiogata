import axios from "axios";
import { IAlbum, IArtist, ISong } from "../data/database";
import { IFormatTrackApi } from "./IFormatTrackApi";
import { ISearchApi } from "./ISearchApi";

interface IYoutubeSearchResult {
  items: IYoutubeSearchResultItem[];
}
interface IYoutubeSearchResultItem {
  id: IYoutubeItemId;
  snippet: IYoutubeItemSnippet;
}
interface IYoutubeItemId {
  videoId: string;
}
interface IYoutubeItemSnippet {
  title: string;
}

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

class Youtube implements ISearchApi, IFormatTrackApi {
  public async searchTracks(query: string): Promise<ISong[]> {
    const url = `https://invidio.us/api/v1/search?q=${encodeURIComponent(query)}`;
    const results = await axios.get<IInvidiousVideoResult[]>(url);
    return this.resultToSong(results.data);
  }

  public async searchAll(query: string) {
    return {
      albums: [],
      artists: [],
      tracks: await this.searchTracks(query),
    };
  }

  public async getAlbumTracks(album: IAlbum) {
    return [];
  }

  public async getArtistAlbums(artist: IArtist) {
    return [];
  }

  public async getTrackUrl(song: ISong): Promise<string> {
    const url = `https://invidio.us/api/v1/videos/${song.apiId}`;
    const results = await axios.get<IInvidiousVideoResponse>(url);
    const formats = results.data.adaptiveFormats;
    const audioFormat = formats.filter(f => f.itag === "140")[0];
    return audioFormat.url;
  }

  public resultToSong(results: IInvidiousVideoResult[]): ISong[] {
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
}

export default Youtube;

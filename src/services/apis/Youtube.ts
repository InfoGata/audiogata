import axios from "axios";
import { ISong } from "../data/database";

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
interface IInvidiousVideoResponse {
  adaptiveFormats: IInvidiousFormat[];
}
interface IInvidiousFormat {
  itag: string;
  url: string;
}

class Youtube {
  private readonly key = "AIzaSyBpa2xO2CivhWu0geWxm8PxVBMPxd2eZSY";
  private readonly corsProxyUrl = "localhost";

  public async searchTracks(query: string): Promise<ISong[]> {
    const url = "https://www.googleapis.com/youtube/v3/search";
    const urlWithQuery = `${url}?part=id,snippet&type=video&maxResults=50&key=${
      this.key
    }&q=${encodeURIComponent(query)}`;
    const results = await axios.get<IYoutubeSearchResult>(urlWithQuery);
    return this.resultToSong(results.data);
  }

  public async getTrackUrl(song: ISong): Promise<string> {
    const url = `https://invidio.us/api/v1/videos/${song.apiId}`;
    const results = await axios.get<IInvidiousVideoResponse>(url);
    const formats = results.data.adaptiveFormats;
    const audioFormat = formats.filter(f => f.itag === "140")[0];
    return audioFormat.url;
  }

  public resultToSong(result: IYoutubeSearchResult): ISong[] {
    const items = result.items;
    return items.map(
      i =>
        ({
          apiId: i.id.videoId,
          from: "youtube",
          name: i.snippet.title,
        } as ISong),
    );
  }
}

export default Youtube;

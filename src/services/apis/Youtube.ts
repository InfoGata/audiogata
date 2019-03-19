import axios from "axios";
import ytdl from "ytdl-core";
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
    const youtubeUrl = `http://www.youtube.com/watch?v=${song.apiId}`;
    const info = await ytdl.getInfo(youtubeUrl, {
      requestOptions: {
        transform: (parsed: any) => {
          parsed.protocol = "http:";
          return {
            headers: { Host: parsed.host },
            host: this.corsProxyUrl,
            path: "/" + parsed.href,
            port: 8080,
            protocol: "http:",
          };
        },
      },
    });
    const formatInfo = info.formats.filter(f => f.itag === "140")[0];
    return formatInfo.url;
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

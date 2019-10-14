import axios from "axios";
import ytdl from "ytdl-core";
import { IAlbum, IArtist, IImage, ISong } from "../../models";
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
  thumbnails: IYoutubeThumbnails;
}
interface IYoutubeThumbnails {
  default: IImage;
  medium: IImage;
  high: IImage;
}

interface IInvidiousVideoResult {
  title: string;
  videoId: string;
  lengthSeconds: number;
  videoThumbnails: IImage[];
}

interface IInvidiousVideoResponse {
  adaptiveFormats: IInvidiousFormat[];
}

interface IInvidiousFormat {
  itag: string;
  url: string;
}

const useInvidious = true;
const key = "AIzaSyDryzen_v2kWUhKuZFCnF6e9wtUxdXWhqY";
const corsProxyUrl = "localhost";

function resultToSongInvidous(results: IInvidiousVideoResult[]): ISong[] {
  return results.map(
    r =>
      ({
        apiId: r.videoId,
        duration: r.lengthSeconds,
        from: "youtube",
        images: r.videoThumbnails.map(v => ({
          height: v.height,
          url: v.url,
          width: v.width,
        })),
        name: r.title,
      } as ISong),
  );
}

function resultToSongYoutube(result: IYoutubeSearchResult): ISong[] {
  const items = result.items;
  return items.map(
    i =>
      ({
        apiId: i.id.videoId,
        from: "youtube",
        images: [
          i.snippet.thumbnails.default,
          i.snippet.thumbnails.medium,
          i.snippet.thumbnails.high,
        ],
        name: i.snippet.title,
      } as ISong),
  );
}

async function searchTracks(query: string): Promise<ISong[]> {
  return useInvidious ?
    searchInvidious(query) :
    searchYoutube(query);
}

async function searchYoutube(query: string): Promise<ISong[]> {
  const url = "https://www.googleapis.com/youtube/v3/search";
  const urlWithQuery = `${url}?part=id,snippet&type=video&maxResults=50&key=${
    key
    }&q=${encodeURIComponent(query)}`;
  const results = await axios.get<IYoutubeSearchResult>(urlWithQuery);
  return resultToSongYoutube(results.data);
}

async function searchInvidious(query: string): Promise<ISong[]> {
  const url = `https://invidio.us/api/v1/search?q=${encodeURIComponent(query)}`;
  const results = await axios.get<IInvidiousVideoResult[]>(url);
  return resultToSongInvidous(results.data);
}

async function getInvidiousTrack(song: ISong): Promise<string> {
  const url = `https://invidio.us/api/v1/videos/${song.apiId}`;
  const results = await axios.get<IInvidiousVideoResponse>(url);
  const formats = results.data.adaptiveFormats;
  const audioFormat = formats.filter(f => f.itag === "140")[0];
  return audioFormat.url;
}

async function getYoutubeTrack(song: ISong): Promise<string> {
  const youtubeUrl = `http://www.youtube.com/watch?v=${song.apiId}`;
  const info = await ytdl.getInfo(youtubeUrl, {
    requestOptions: {
      transform: (parsed: any) => {
        parsed.protocol = "http:";
        return {
          headers: { Host: parsed.host },
          host: corsProxyUrl,
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
    return useInvidious ? getInvidiousTrack(song) : getYoutubeTrack(song);
  }
} as IFormatTrackApi & ISearchApi

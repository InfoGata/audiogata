import axios from "axios";
import { parse, toSeconds } from "iso8601-duration";
import ytdl from "ytdl-core";
import { IAlbum, IArtist, IImage, IPlaylist, ISong } from "../models";
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
  playlistId: string;
}
interface IYoutubeResult {
  items: IYoutubeItem[];
}
interface IYoutubeItem {
  id: string;
  snippet: IYoutubeItemSnippet;
  contentDetails: IYoutubeContentDetails;
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
interface IYoutubeContentDetails {
  duration: string;
}
interface IYoutubePlaylistItemResult {
  items: IYoutubePlaylistItemItem[];
}
interface IYoutubePlaylistItemItem {
  contentDetails: IYoutubePlaylistItemDetails;
}
interface IYoutubePlaylistItemDetails {
  videoId: string;
}

const key = "AIzaSyASG5R6Ea6lRT99-GLa2TwbPz5Md7aFL3g";
const corsProxyUrl = "localhost";

function playlistResultToPlaylistYoutube(result: IYoutubeSearchResult): IPlaylist[] {
  return result.items.map(r => ({
    apiId: r.id.playlistId,
    from: "youtube",
    name: r.snippet.title,
    songs: [],
  }));
}

function resultToSongYoutube(result: IYoutubeResult): ISong[] {
  const items = result.items;
  return items.map(
    i =>
      ({
        apiId: i.id,
        duration: toSeconds(parse(i.contentDetails.duration)),
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
  return searchYoutube(query);
}

async function getPlaylistTracks(playlist: IPlaylist): Promise<ISong[]> {
  return getYoutubePlaylistTracks(playlist);
}

async function getYoutubePlaylistTracks(playlist: IPlaylist): Promise<ISong[]> {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems`;
  const urlWithQuery = `${url}?part=contentDetails&maxResults=50&key=${key}&playlistId=${playlist.apiId}`;
  const result = await axios.get<IYoutubePlaylistItemResult>(urlWithQuery);
  const detailsUrl = "https://www.googleapis.com/youtube/v3/videos";
  const ids = result.data.items.map(i => i.contentDetails.videoId).join(',');
  const detailsUrlWithQuery = `${detailsUrl}?key=${key}&part=snippet,contentDetails&id=${ids}`
  const detailsResults = await axios.get<IYoutubeResult>(detailsUrlWithQuery);
  return resultToSongYoutube(detailsResults.data);
}

async function searchPlaylists(query: string): Promise<IPlaylist[]> {
  return searchYoutubePlaylists(query);
}

async function searchYoutubePlaylists(query: string): Promise<IPlaylist[]> {
  const url = "https://www.googleapis.com/youtube/v3/search";
  const urlWithQuery = `${url}?part=snippet&type=playlist&maxResults=50&key=${key}&q=${encodeURIComponent(
    query,
  )}`;
  const result = await axios.get<IYoutubeSearchResult>(urlWithQuery);
  return playlistResultToPlaylistYoutube(result.data);
}


async function searchYoutube(query: string): Promise<ISong[]> {
  const url = "https://www.googleapis.com/youtube/v3/search";
  const urlWithQuery = `${url}?part=id&type=video&maxResults=50&key=${
    key
    }&q=${encodeURIComponent(query)}`;
  const results = await axios.get<IYoutubeSearchResult>(urlWithQuery);
  const detailsUrl = "https://www.googleapis.com/youtube/v3/videos";
  const ids = results.data.items.map(i => i.id.videoId).join(',');
  const detailsUrlWithQuery = `${detailsUrl}?key=${key}&part=snippet,contentDetails&id=${ids}`
  const detailsResults = await axios.get<IYoutubeResult>(detailsUrlWithQuery);
  return resultToSongYoutube(detailsResults.data);
}


async function getYoutubeTrack(song: ISong): Promise<string> {
  const youtubeUrl = `http://www.youtube.com/watch?v=${song.apiId}`;
  console.log(youtubeUrl);
  const info = await ytdl.getInfo(youtubeUrl, {
    requestOptions: {
      transform: (parsed: any) => {
        parsed.protocol = "http:";
        return {
          headers: { Host: parsed.host },
          host: corsProxyUrl,
          path: "/" + parsed.href,
          maxRedirects: 10,
          port: 8085,
          protocol: "http:",
        };
      },
    },
  });
  console.log(info);
  const formatInfo = info.formats.filter(f => f.itag === 140)[0];
  return formatInfo.url;
}

export default {
  name: "youtube",
  async getAlbumTracks(_album: IAlbum) {
    return [];
  },
  async getArtistAlbums(_artist: IArtist) {
    return [];
  },
  async getPlaylistTracks(playlist: IPlaylist) {
    return await getPlaylistTracks(playlist);
  },
  async searchAll(query: string) {
    return {
      albums: [],
      artists: [],
      playlists: await searchPlaylists(query),
      tracks: await searchTracks(query),
    };
  },
  async getTrackUrl(song: ISong): Promise<string> {
    return getYoutubeTrack(song);
  }
} as IFormatTrackApi & ISearchApi

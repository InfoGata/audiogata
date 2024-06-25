import {
  LinkOptions
} from "@tanstack/react-router";
import {
  Album,
  Artist,
  ArtistInfo,
  PlayTrackRequest,
  PlaylistInfo,
  Track,
} from "./plugintypes";
import { router } from "./router";

export interface NetworkRequest {
  body: Blob | ArrayBuffer | null;
  headers: { [k: string]: string };
  status: number;
  statusText: string;
  url: string;
}

export interface InfoGataExtension {
  networkRequest: (
    input: string,
    init?: RequestInit
  ) => Promise<NetworkRequest>;
}

declare global {
  interface Window {
    InfoGata: InfoGataExtension;
    cordovaFetch: typeof fetch;
  }
}

export interface DirectoryFile extends File {
  webkitRelativePath: string;
}

export interface UrlInfo {
  url: string;
  headers?: Headers;
}

export interface FileType {
  filelist?: FileList;
  url?: UrlInfo;
}

export const enum SearchResultType {
  Tracks = "tracks",
  Albums = "albums",
  Artists = "artists",
  Playlists = "playlists",
}

export const enum PlayerComponentType {
  onSetVolume = "onSetVolume",
  onPause = "onPause",
  onResume = "onResume",
  onSeek = "onSeek",
  onPlay = "onPlay",
  onSetPlaybackRate = "onSetPlaybackRate",
}

export type TrackItemType = {
  type: "track";
  item: Track;
};
export type PlaylistItemType = {
  type: "playlist";
  item: PlaylistInfo;
};
export type AlbumItemType = {
  type: "album";
  item: Album;
};
export type ArtistItemType = {
  type: "artist";
  item: Artist;
};
export type ItemMenuType =
  | TrackItemType
  | PlaylistItemType
  | AlbumItemType
  | ArtistItemType;

export interface PlayerComponent {
  [PlayerComponentType.onSetVolume]: (volume: number) => Promise<void>;
  [PlayerComponentType.onPause]: () => Promise<void>;
  [PlayerComponentType.onResume]: () => Promise<void>;
  [PlayerComponentType.onSeek]: (time: number) => Promise<void>;
  [PlayerComponentType.onPlay]: (request: PlayTrackRequest) => Promise<void>;
  [PlayerComponentType.onSetPlaybackRate]: (rate: number) => Promise<void>;
}

export type LinkRouterProps = LinkOptions<typeof router>;

export interface NavigationLinkItem {
  title: string;
  link?: LinkRouterProps;
  action?: () => void;
  icon: React.JSX.Element;
}

export interface MultipleArtistItem {
  artistApiId?: string;
  artistName?: string;
  addtionalArtists?: ArtistInfo[];
  pluginId?: string;
}

import {
  Album,
  Artist,
  PlaylistInfo,
  PlayTrackRequest,
  Track,
} from "./plugintypes";

export interface NetworkRequest {
  body: Blob | ArrayBuffer;
  headers: { [k: string]: string };
  status: number;
  statusText: string;
  url: string;
}

export interface InfoGataExtension {
  networkRequest: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<NetworkRequest>;
}

declare global {
  interface Window {
    InfoGata: InfoGataExtension;
    cordovaFetch: typeof fetch;
  }
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_DOMAIN: string;
    }
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

export interface Manifest {
  name: string;
  script: string;
  id?: string;
  version?: string;
  description?: string;
  options?: string | ManifestOptions;
  homepage?: string;
  updateUrl?: string;
}

export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
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

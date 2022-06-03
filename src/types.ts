export interface NetworkRequest {
  body: Blob;
  headers: { [k: string]: string };
  status: number;
  statusText: string;
  url: string;
}

export interface MediaGataExtension {
  networkRequest: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<NetworkRequest>;
}

declare global {
  interface Window {
    MediaGata: MediaGataExtension;
    cordovaFetch: typeof fetch;
  }
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_GITLAB_ACCESS_TOKEN: string;
    }
  }
}

export interface ISong {
  id?: string;
  name: string;
  source: string;
  from?: string;
  apiId?: string;
  duration?: number;
  albumId?: string;
  artistId?: string;
  artistName?: string;
  hasBlob?: string;
  images: IImage[];
}

export interface IAlbum {
  name: string;
  apiId: string;
  from?: string;
  artistName?: string;
  artistId?: string;
  images: IImage[];
}

export interface IArtist {
  name: string;
  apiId: string;
  from?: string;
  images: IImage[];
}

export interface IPlaylist extends PlaylistInfo {
  songs: ISong[];
  apiId?: string;
  from?: string;
}

export interface PlaylistInfo {
  id?: string;
  images?: IImage[];
  name?: string;
  isUserPlaylist?: boolean;
}

export interface IImage {
  url: string;
  height: number;
  width: number;
}

export interface NotificationMessage {
  message: string;
  type?: "default" | "success" | "error" | "warning" | "info";
}

export interface PluginInfo {
  id?: string;
  name: string;
  script: string;
  version?: string;
  description?: string;
  optionsHtml?: string;
  optionsSameOrigin?: boolean;
}

export interface DirectoryFile extends File {
  webkitRelativePath: string;
}

export interface UrlInfo {
  url: string;
  headers: Headers;
}

export interface FileType {
  filelist?: FileList;
  url?: UrlInfo;
}

export interface Manifest {
  name: string;
  script: string;
  version?: string;
  description?: string;
  options?: string | ManifestOptions;
}

export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
  offset: number;
  nextPage?: string;
  prevPage?: string;
}

export interface SearchAllResult {
  tracks?: SearchTrackResult;
  albums?: SearchAlbumResult;
  artists?: SearchArtistResult;
  playlists?: SearchPlaylistResult;
}

export interface SearchRequest {
  query: string;
  page?: PageInfo;
}

export interface PlaylistTrackRequest {
  playlist: IPlaylist;
  page?: PageInfo;
}

export interface UserPlaylistRequest {
  page?: PageInfo;
}

export interface SearchTrackResult {
  items: ISong[];
  pageInfo?: PageInfo;
}

export interface SearchArtistResult {
  items: IArtist[];
  pageInfo?: PageInfo;
}

export interface SearchAlbumResult {
  items: IAlbum[];
  pageInfo?: PageInfo;
}

export interface SearchPlaylistResult {
  items: IPlaylist[];
  pageInfo?: PageInfo;
}

export const ResultType = {
  Tracks: "tracks",
  Albums: "albums",
  Artists: "artists",
  Playlists: "playlists",
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ResultType = typeof ResultType[keyof typeof ResultType];

export interface PlayerComponent {
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  play: (song: ISong) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
}

export type PlayerComponentType = keyof PlayerComponent;

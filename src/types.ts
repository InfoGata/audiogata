import { Track } from "./plugintypes";

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
  play: (track: Track) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
}

export type PlayerComponentType = keyof PlayerComponent;

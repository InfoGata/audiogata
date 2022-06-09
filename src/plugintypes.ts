export interface PluginInfo {
  id?: string;
  name: string;
  script: string;
  version?: string;
  description?: string;
  optionsHtml?: string;
  optionsSameOrigin?: boolean;
  updateUrl?: string;
}

export interface Track {
  id?: string;
  name: string;
  source?: string;
  pluginId?: string;
  apiId?: string;
  duration?: number;
  albumApiId?: string;
  albumName?: string;
  artistApiId?: string;
  artistName?: string;
  images?: ImageInfo[];
}

export interface Album {
  name: string;
  apiId: string;
  pluginId?: string;
  artistName?: string;
  artistApiId?: string;
  images?: ImageInfo[];
}

export interface Artist {
  name: string;
  apiId: string;
  pluginId?: string;
  images?: ImageInfo[];
}

export interface PlaylistInfo {
  id?: string;
  images?: ImageInfo[];
  name?: string;
  isUserPlaylist?: boolean;
  apiId?: string;
  pluginId?: string;
}

export interface Playlist extends PlaylistInfo {
  tracks: Track[];
}

export interface ImageInfo {
  url: string;
  height: number;
  width: number;
}

export interface NotificationMessage {
  message: string;
  type?: "default" | "success" | "error" | "warning" | "info";
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
  playlist: PlaylistInfo;
  page?: PageInfo;
}

export interface UserPlaylistRequest {
  page?: PageInfo;
}

export interface SearchTrackResult {
  items: Track[];
  pageInfo?: PageInfo;
}

export interface SearchArtistResult {
  items: Artist[];
  pageInfo?: PageInfo;
}

export interface SearchAlbumResult {
  items: Album[];
  pageInfo?: PageInfo;
}

export interface SearchPlaylistResult {
  items: PlaylistInfo[];
  pageInfo?: PageInfo;
}

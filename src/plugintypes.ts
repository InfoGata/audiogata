export interface Track {
  id?: string;
  name: string;
  source?: string;
  from?: string;
  apiId?: string;
  duration?: number;
  albumId?: string;
  artistId?: string;
  artistName?: string;
  hasBlob?: string;
  images: ImageInfo[];
}

export interface Album {
  name: string;
  apiId: string;
  from?: string;
  artistName?: string;
  artistId?: string;
  images: ImageInfo[];
}

export interface Artist {
  name: string;
  apiId: string;
  from?: string;
  images: ImageInfo[];
}

export interface Playlist extends PlaylistInfo {
  tracks: Track[];
  apiId?: string;
  from?: string;
}

export interface PlaylistInfo {
  id?: string;
  images?: ImageInfo[];
  name?: string;
  isUserPlaylist?: boolean;
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

export interface PluginInfo {
  id?: string;
  name: string;
  script: string;
  version?: string;
  description?: string;
  optionsHtml?: string;
  optionsSameOrigin?: boolean;
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
  playlist: Playlist;
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
  items: Playlist[];
  pageInfo?: PageInfo;
}

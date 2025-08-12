export interface PluginInfo {
  id?: string;
  name: string;
  script: string;
  version?: string;
  description?: string;
  optionsHtml?: string;
  optionsSameOrigin?: boolean;
  manifestUrl?: string;
  homepage?: string;
  manifest?: Manifest;
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
  addtionalArtists?: ArtistInfo[];
  originalUrl?: string;
}

export interface Album {
  id?: string;
  name?: string;
  apiId?: string;
  pluginId?: string;
  artistName?: string;
  artistApiId?: string;
  images?: ImageInfo[];
  addtionalArtists?: ArtistInfo[];
  originalUrl?: string;
}

export interface Artist {
  id?: string;
  name?: string;
  apiId?: string;
  pluginId?: string;
  images?: ImageInfo[];
  originalUrl?: string;
}

export interface ArtistInfo {
  name: string;
  apiId?: string;
}

export interface PlaylistInfo {
  id?: string;
  images?: ImageInfo[];
  name?: string;
  isUserPlaylist?: boolean;
  apiId?: string;
  pluginId?: string;
  originalUrl?: string;
}

export interface Playlist extends PlaylistInfo {
  tracks: Track[];
}

export interface ImageInfo {
  url: string;
  height?: number;
  width?: number;
}

export interface NotificationMessage {
  message: string;
  type?: "default" | "success" | "error" | "warning" | "info";
}

export interface SearchResult {
  filterInfo?: FilterInfo;
  pageInfo?: PageInfo;
}

export interface PageInfo {
  totalResults?: number;
  resultsPerPage: number;
  offset: number;
  nextPage?: string;
  prevPage?: string;
}

export interface FilterInfo {
  filters: Filter[];
}

export interface SearchAllResult {
  tracks?: SearchTrackResult;
  albums?: SearchAlbumResult;
  artists?: SearchArtistResult;
  playlists?: SearchPlaylistResult;
}

export interface SearchRequest {
  query: string;
  pageInfo?: PageInfo;
  filterInfo?: FilterInfo;
}

export interface PlaylistTrackRequest {
  apiId?: string;
  isUserPlaylist: boolean;
  pageInfo?: PageInfo;
}

export interface AlbumTrackRequest {
  apiId?: string;
  pageInfo?: PageInfo;
}

export interface ArtistAlbumRequest {
  apiId?: string;
  pageInfo?: PageInfo;
}

export interface ArtistTopTracksRequest {
  apiId?: string;
  pageInfo?: PageInfo;
}

export interface UserPlaylistRequest {
  pageInfo?: PageInfo;
}

export interface SearchTrackResult extends SearchResult {
  items: Track[];
}

export interface PlaylistTracksResult extends SearchTrackResult {
  playlist?: PlaylistInfo;
}

export interface ArtistAlbumsResult extends SearchAlbumResult {
  artist?: Artist;
}

export interface ArtistTopTracksResult extends SearchTrackResult {
  artist?: Artist;
}

export interface AlbumTracksResult extends SearchTrackResult {
  album?: Album;
}

export interface SearchArtistResult extends SearchResult {
  items: Artist[];
}

export interface SearchAlbumResult extends SearchResult {
  items: Album[];
}

export interface SearchPlaylistResult extends SearchResult {
  items: PlaylistInfo[];
}

export interface GetTrackRequest {
  apiId: string;
}

export interface GetTrackUrlRequest {
  apiId?: string;
}

export interface PlayTrackRequest {
  apiId?: string;
  source?: string;
  seekTime?: number;
}

export type FilterType = "radio" | "select" | "text";

export interface Filter {
  id: string;
  displayName: string;
  type: FilterType;
  value?: string;
  options?: FilterOption[];
}

export interface FilterOption {
  displayName: string;
  value: string;
}

export type ParseUrlType = "playlist" | "track";

export interface LookupTrackRequest {
  trackName: string;
  artistName?: string;
}

export interface GetLyricsRequest {
  trackName: string;
  artistName?: string;
}

export interface GetLyricsResponse {
  lyrics: string;
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
  authentication?: ManifestAuthentication;
}

export interface ManifestAuthentication {
  loginUrl: string;
  cookiesToFind?: string[];
  loginButton?: string;
  headersToFind?: string[];
  domainHeadersToFind: Record<string, string[]>;
  completionUrl?: string;
}

export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
}

export interface GetSearchSuggestionRequest {
  query: string;
}

export type Theme = "dark" | "light" | "system";

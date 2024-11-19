import { PluginFrame } from "plugin-frame";
import React from "react";
import {
  AlbumTrackRequest,
  AlbumTracksResult,
  ArtistAlbumRequest,
  ArtistAlbumsResult,
  GetLyricsRequest,
  GetLyricsResponse,
  GetSearchSuggestionRequest,
  GetTrackRequest,
  GetTrackUrlRequest,
  LookupTrackRequest,
  ParseUrlType,
  PlayTrackRequest,
  Playlist,
  PlaylistTrackRequest,
  PlaylistTracksResult,
  PluginInfo,
  SearchAlbumResult,
  SearchAllResult,
  SearchArtistResult,
  SearchPlaylistResult,
  SearchRequest,
  SearchTrackResult,
  Theme,
  Track,
  UserPlaylistRequest,
} from "./plugintypes";
import { PlayerComponent } from "./types";

export interface PluginMethodInterface extends PlayerComponent {
  onSearchAll(request: SearchRequest): Promise<SearchAllResult>;
  onSearchTracks(request: SearchRequest): Promise<SearchTrackResult>;
  onSearchArtists(request: SearchRequest): Promise<SearchArtistResult>;
  onSearchAlbums(request: SearchRequest): Promise<SearchAlbumResult>;
  onSearchPlaylists(request: SearchRequest): Promise<SearchPlaylistResult>;
  onGetTrack(request: GetTrackRequest): Promise<Track>;
  onNowPlayingTracksAdded(tracks: Track[]): Promise<void>;
  onNowPlayingTracksRemoved(tracks: Track[]): Promise<void>;
  onNowPlayingTracksChanged(tracks: Track[]): Promise<void>;
  onNowPlayingTracksSet(tracks: Track[]): Promise<void>;
  onGetTrackUrl(request: GetTrackUrlRequest): Promise<string>;
  onUiMessage(message: any): Promise<void>;
  onDeepLinkMessage(message: string): Promise<void>;
  onGetAlbumTracks(request: AlbumTrackRequest): Promise<AlbumTracksResult>;
  onGetPlaylistTracks(
    request: PlaylistTrackRequest
  ): Promise<PlaylistTracksResult>;
  onGetArtistAlbums(request: ArtistAlbumRequest): Promise<ArtistAlbumsResult>;
  onPlay(request: PlayTrackRequest): Promise<void>;
  onSetVolume(volume: number): Promise<void>;
  onPause(): Promise<void>;
  onResume(): Promise<void>;
  onSeek(time: number): Promise<void>;
  onSetPlaybackRate(rate: number): Promise<void>;
  onGetUserPlaylists(
    request: UserPlaylistRequest
  ): Promise<SearchPlaylistResult>;
  onGetTopItems(): Promise<SearchAllResult>;
  onCanParseUrl(url: string, type: ParseUrlType): Promise<boolean>;
  onLookupPlaylistUrl(url: string): Promise<Playlist>;
  onLookupTrackUrls(url: string[]): Promise<Track[]>;
  onLookupTrack(request: LookupTrackRequest): Promise<Track>;
  onGetLyrics(request: GetLyricsRequest): Promise<GetLyricsResponse>;
  onGetSearchSuggestions(
    request: GetSearchSuggestionRequest
  ): Promise<string[]>;
  onChangeTheme(theme: Theme): Promise<void>;
  onPostLogin(): Promise<void>;
  onPostLogout(): Promise<void>;
}

export interface PluginMessage {
  pluginId?: string;
  message: any;
}

export class PluginFrameContainer extends PluginFrame<PluginMethodInterface> {
  name?: string;
  id?: string;
  hasOptions?: boolean;
  fileList?: FileList;
  optionsSameOrigin?: boolean;
  version?: string;
  manifestUrl?: string;
}

export interface PluginContextInterface {
  addPlugin: (plugin: PluginInfo, pluginFiles?: FileList) => Promise<void>;
  updatePlugin: (
    plugin: PluginInfo,
    id: string,
    pluginFiles?: FileList
  ) => Promise<void>;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
  plugins: PluginFrameContainer[];
  pluginMessage?: PluginMessage;
  pluginsLoaded: boolean;
  pluginsFailed: boolean;
  preinstallComplete: boolean;
  reloadPlugins: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const PluginsContext = React.createContext<PluginContextInterface>(undefined!);
export default PluginsContext;

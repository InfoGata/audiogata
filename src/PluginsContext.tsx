import React from "react";
import {
  Playlist,
  Track,
  PlaylistTrackRequest,
  PluginInfo,
  SearchAlbumResult,
  SearchAllResult,
  SearchArtistResult,
  SearchPlaylistResult,
  SearchRequest,
  SearchTrackResult,
  UserPlaylistRequest,
  PlaylistTracksResult,
  ArtistAlbumsResult,
  AlbumTracksResult,
  AlbumTrackRequest,
  ArtistAlbumRequest,
  GetTrackUrlRequest,
  PlayTrackRequest,
  GetTrackRequest,
  ParseUrlType,
  LookupTrackRequest,
} from "./plugintypes";
import { PluginFrame } from "plugin-frame";
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
  reloadPlugins: () => Promise<void>;
}

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);
export default PluginsContext;

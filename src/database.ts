import Dexie from "dexie";
import {
  Album,
  Artist,
  Playlist,
  PlaylistInfo,
  PluginInfo,
  Track,
} from "./plugintypes";

class AudioDatabase extends Dexie {
  audioBlobs: Dexie.Table<AudioBlob, string>;
  plugins: Dexie.Table<PluginInfo, string>;
  playlists: Dexie.Table<Playlist, string>;
  favoriteTracks: Dexie.Table<Track, string>;
  favoriteAlbums: Dexie.Table<Album, string>;
  favoriteArtists: Dexie.Table<Artist, string>;
  favoritePlaylists: Dexie.Table<PlaylistInfo, string>;

  constructor() {
    super("AudioDatabase");
    this.version(1).stores({
      audioBlobs: "id",
      plugins: "id",
      playlists: "id",
    });
    this.version(2).stores({
      favoriteTracks: "id, [pluginId+apiId]",
      favoriteAlbums: "id, [pluginId+apiId]",
      favoriteArtists: "id, [pluginId+apiId]",
      favoritePlaylists: "id, [pluginId+apiId]",
    });
    this.audioBlobs = this.table("audioBlobs");
    this.plugins = this.table("plugins");
    this.playlists = this.table("playlists");
    this.favoriteTracks = this.table("favoriteTracks");
    this.favoriteAlbums = this.table("favoriteAlbums");
    this.favoriteArtists = this.table("favoriteArtists");
    this.favoritePlaylists = this.table("favoritePlaylists");
  }
}

export interface AudioBlob {
  id: string;
  blob: Blob;
}

export const db = new AudioDatabase();

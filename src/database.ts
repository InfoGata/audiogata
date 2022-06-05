import dexie from "dexie";
import { Playlist, PluginInfo } from "./types";

class AudioDatabase extends dexie {
  audioBlobs: Dexie.Table<AudioBlob, string>;
  plugins: Dexie.Table<PluginInfo, string>;
  playlists: Dexie.Table<Playlist, string>;

  constructor() {
    super("AudioDatabase");
    this.version(1).stores({
      audioBlobs: "id",
      plugins: "id",
      playlists: "id",
    });
    this.audioBlobs = this.table("audioBlobs");
    this.plugins = this.table("plugins");
    this.playlists = this.table("playlists");
  }
}

export interface AudioBlob {
  id: string;
  blob: Blob;
}

export const db = new AudioDatabase();

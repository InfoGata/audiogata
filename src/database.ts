import Dexie from "dexie";
import { Playlist, PluginInfo } from "./plugintypes";

class AudioDatabase extends Dexie {
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

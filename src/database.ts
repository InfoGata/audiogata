import dexie from "dexie";
import { PluginInfo } from "./types";

class AudioDatabase extends dexie {
  audioBlobs: Dexie.Table<AudioBlob, string>;
  plugins: Dexie.Table<PluginInfo, string>;

  constructor() {
    super("AudioDatabase");
    this.version(1).stores({
      audioBlobs: "id",
      plugins: "id",
    });
    this.audioBlobs = this.table("audioBlobs");
    this.plugins = this.table("plugins");
  }
}

export interface AudioBlob {
  id: string;
  blob: Blob;
}

export const db = new AudioDatabase();

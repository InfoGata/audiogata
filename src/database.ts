import dexie from "dexie";

class AudioDatabase extends dexie {
  audioBlobs: Dexie.Table<AudioBlob, string>;

  constructor() {
    super("AudioDatabase");
    this.version(1).stores({
      audioBlobs: 'id',
    });
    this.audioBlobs = this.table("audioBlobs");
  }
}

export interface AudioBlob {
  id: string;
  blob: Blob;
}

export const db = new AudioDatabase();
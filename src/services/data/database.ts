import Dexie from "dexie";
import "dexie-observable";

export class Database extends Dexie {
  public songs: Dexie.Table<ISong, string>;
  public config: Dexie.Table<IConfig, number>;
  constructor() {
    super("database");

    this.version(1).stores({
      config: "++id, currentSongId, currentTime",
      songs:
        "$$id, name, source, blob, useBlob, from, dateAdded, sortOrder, apiId",
    });

    this.songs = this.table("songs");
    this.config = this.table("config");
  }
}

export interface ISong {
  id?: string;
  name: string;
  source: string;
  useBlob: boolean;
  blob?: Blob;
  from?: string;
  dateAdded: Date;
  sortOrder: number;
  apiId?: string;
}

export interface IConfig {
  id?: number;
  currentSongId?: string;
  currentTime?: number;
}

export interface IAlbum {
  name: string;
  apiId: string;
  from: string;
}

export interface IArtist {
  name: string;
  apiId: string;
  from: string;
}

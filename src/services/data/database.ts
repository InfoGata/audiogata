import Dexie from "dexie";
import "dexie-observable";

export class Database extends Dexie {
  public songs: Dexie.Table<ISong, string>;
  public config: Dexie.Table<IConfig, number>;
  public auth: Dexie.Table<IAuth, string>;
  constructor() {
    super("database");

    this.version(1).stores({
      auth: "$$id, name, accessToken, refreshToken",
      config: "++id, currentSongId, currentTime",
      songs:
        "$$id, name, source, blob, useBlob, from, dateAdded, sortOrder, apiId",
    });

    this.songs = this.table("songs");
    this.config = this.table("config");
    this.auth = this.table("auth");
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

export interface IAuth {
  id?: string;
  name: string;
  accessToken: string;
  refreshToken: string;
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

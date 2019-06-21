import Dexie from "dexie";
import "dexie-observable";

class Database extends Dexie {
  public songs: Dexie.Table<ISong, string>;
  public auth: Dexie.Table<IAuth, string>;
  constructor() {
    super("database");

    this.version(1).stores({
      config: "++id, currentSongId, currentTime",
      songs:
        "$$id, name, source, blob, useBlob, from, dateAdded, sortOrder, apiId",
    });

    this.version(2).stores({
      auth: "$$id, name, accessToken, refreshToken",
    });

    this.songs = this.table("songs");
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
  duration?: number;
  albumId?: string;
  artistId?: string;
  artistName?: string;
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
  artistName?: string;
  artistId?: string;
}

export interface IArtist {
  name: string;
  apiId: string;
  from: string;
}

export interface IPlaylist {
  id?: string;
  name: string;
  songs: ISong[];
}

export const db = new Database();

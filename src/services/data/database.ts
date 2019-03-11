import Dexie from 'dexie';
import 'dexie-observable';

export class Database extends Dexie {
  songs: Dexie.Table<ISong, string>;
  config: Dexie.Table<IConfig, number>;
  constructor() {
    super('database');

    this.version(1).stores({
      songs: '$$id, name, source, blob, useBlob, from, dateAdded, sortOrder',
      config: '++id, currentSongId, currentTime'
    });

    this.songs = this.table('songs');
    this.config = this.table('config');
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
}

export interface IConfig {
  id?: number;
  currentSongId?: string;
  currentTime?: number;
}

export interface IAlbum {
  name: string
  apiId: string;
  from: string;
}

export interface IArtist {
  name: string;
  apiId: string;
  from: string;
}
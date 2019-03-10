import Dexie from 'dexie';

export class Database extends Dexie {
  songs: Dexie.Table<ISong, number>;
  config: Dexie.Table<IConfig, number>;
  constructor() {
    super('database');

    this.version(1).stores({
      songs: '++id, name, source, blob, useBlob, from',
      config: '++id, currentSongId, currentTime'
    });

    this.songs = this.table('songs');
    this.config = this.table('config');
  }
}

export interface ISong {
  id?: number;
  name: string;
  source: string;
  useBlob: boolean;
  blob?: Blob;
  from?: string;
}

export interface IConfig {
  id?: number;
  currentSongId?: number;
  currentTime?: number;
}

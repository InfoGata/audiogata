import Dexie from 'dexie';

export class Database extends Dexie {
  songs: Dexie.Table<ISong, number>;
  constructor() {
    super('database');

    this.version(1).stores({
      songs: '++id, name, source, blob, useBlob'
    });

    this.songs = this.table('songs');
  }
}

export interface ISong {
  id?: number;
  name: string;
  source: string;
  useBlob: boolean;
  blob?: Blob;
}

export interface CurrentInfo {
  songId: number;
  time: number;
}

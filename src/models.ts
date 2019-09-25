export interface ISong {
  id?: string;
  name: string;
  source: string;
  useBlob: boolean;
  blob?: Blob;
  from?: string;
  apiId?: string;
  duration?: number;
  albumId?: string;
  artistId?: string;
  artistName?: string;
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

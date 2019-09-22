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

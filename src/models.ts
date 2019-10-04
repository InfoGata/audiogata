export interface ISong {
  id?: string;
  name: string;
  source: string;
  from?: string;
  apiId?: string;
  duration?: number;
  albumId?: string;
  artistId?: string;
  artistName?: string;
  images: IImage[];
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

export interface IImage {
  url: string;
  height: number;
  width: number;
}

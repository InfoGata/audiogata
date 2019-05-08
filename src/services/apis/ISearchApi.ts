import { IAlbum, IArtist, ISong } from "../data/database";

export interface ISearchApi {
  searchAll: (
    query: string,
  ) => Promise<{ tracks: ISong[]; albums: IAlbum[]; artists: IArtist[] }>;
  getAlbumTracks: (album: IAlbum) => Promise<ISong[]>;
  getArtistAlbums: (artist: IArtist) => Promise<IAlbum[]>;
}

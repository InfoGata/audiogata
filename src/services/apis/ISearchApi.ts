import { IAlbum, IArtist, ISong } from "../../models";

export interface ISearchApi {
  searchAll: (
    query: string,
  ) => Promise<{ tracks: ISong[]; albums: IAlbum[]; artists: IArtist[] }>;
  getAlbumTracks: (album: IAlbum) => Promise<ISong[]>;
  getArtistAlbums: (artist: IArtist) => Promise<IAlbum[]>;
  setAuth?: (accessToken: string, refreshToken?: string) => void;
}

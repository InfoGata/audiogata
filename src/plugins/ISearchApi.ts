import { IAlbum, IArtist, IPlaylist, ISong } from "../models";

export interface ISearchApi {
  searchAll: (
    query: string,
  ) => Promise<{
    tracks?: ISong[];
    albums?: IAlbum[];
    artists?: IArtist[];
    playlists?: IPlaylist[];
  }>;
  getAlbumTracks: (album: IAlbum) => Promise<ISong[]>;
  getPlaylistTracks: (playlist: IPlaylist) => Promise<ISong[]>;
  getArtistAlbums: (artist: IArtist) => Promise<IAlbum[]>;
  setAuth?: (accessToken: string, refreshToken?: string) => void;
}

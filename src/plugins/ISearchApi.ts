import { IAlbum, IArtist, IPlaylist, ISong } from "../types";

export interface ISearchApi {
  name: string;
  searchAll: (query: string) => Promise<{
    tracks?: ISong[];
    albums?: IAlbum[];
    artists?: IArtist[];
    playlists?: IPlaylist[];
  }>;
  getAlbumTracks: (album: IAlbum) => Promise<ISong[]>;
  getPlaylistTracks: (playlist: IPlaylist) => Promise<ISong[]>;
  getArtistAlbums: (artist: IArtist) => Promise<IAlbum[]>;
}

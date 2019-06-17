import { IPlaylist, ISong } from "../../services/data/database";

export const ADD_PLAYLIST = "ADD_PLAYLIST";
export const DELETE_PLAYLIST = "DELETE_PLAYLIST";
export const ADD_SONGS = "ADD_SONGS";

interface IAddPlaylist {
  type: typeof ADD_PLAYLIST;
  name: string
}
export function addPlaylist(name: string): IAddPlaylist {
  return {
    name,
    type: ADD_PLAYLIST,
  };
}

interface IDeletePlaylist {
  type: typeof DELETE_PLAYLIST;
  playlist: IPlaylist
}
export function deletePlaylist(playlist: IPlaylist): IDeletePlaylist {
  return {
    playlist,
    type: DELETE_PLAYLIST,
  };
}

interface IAddSongs {
  type: typeof ADD_SONGS;
  id: string,
  tracks: ISong[]
}
export function addSongs(id: string, tracks: ISong[]): IAddSongs {
  return {
    id,
    tracks,
    type: ADD_SONGS,
  };
}

export type PlaylistActionTypes = IAddPlaylist | IDeletePlaylist | IAddSongs;

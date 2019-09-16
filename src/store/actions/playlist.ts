import { IPlaylist, ISong } from "../../services/data/database";

export const ADD_PLAYLIST = "ADD_PLAYLIST";
export const DELETE_PLAYLIST = "DELETE_PLAYLIST";
export const ADD_SONGS = "ADD_SONGS";
export const SET_SONGS = "SET_SONGS";

interface IAddPlaylist {
  type: typeof ADD_PLAYLIST;
  name: string,
  tracks: ISong[]
}
export function addPlaylist(name: string, tracks: ISong[] = []): IAddPlaylist {
  return {
    name,
    tracks,
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

interface ISetSongs {
  type: typeof SET_SONGS;
  id: string,
  tracks: ISong[]
}
export function setSongs(id: string, tracks: ISong[]): ISetSongs {
  return {
    id,
    tracks,
    type: SET_SONGS,
  };
}

export type PlaylistActionTypes = IAddPlaylist | IDeletePlaylist | IAddSongs | ISetSongs;

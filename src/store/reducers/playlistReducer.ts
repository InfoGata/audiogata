import { v4 as uuid } from "uuid";
import { IPlaylist } from "../../services/data/database";
import { ADD_PLAYLIST, ADD_SONGS, DELETE_PLAYLIST, PlaylistActionTypes } from "../actions/playlist";

interface IPlaylistState {
  playlists: IPlaylist[];
}
const initialState: IPlaylistState = {
  playlists: []
}

export function playlistReducer(state = initialState, action: PlaylistActionTypes): IPlaylistState {
  switch (action.type) {
    case ADD_PLAYLIST:
      const id = uuid();
      const playlist: IPlaylist = { id, name: action.name, songs: action.tracks };
      return {
        ...state,
        playlists: [...state.playlists, playlist]
      };
    case DELETE_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.filter(p => p.id !== action.playlist.id)
      };
    case ADD_SONGS:
      return {
        ...state,
        playlists: state.playlists.map(p =>
          p.id === action.id ? { ...p, songs: action.tracks } : p)
      };
    default:
      return state;
  }
}

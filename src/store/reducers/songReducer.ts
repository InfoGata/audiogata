import { ISong } from '../../services/data/database';
import {
  ADD_TRACK,
  DELETE_TRACK,
  LOAD_TRACKS,
  TrackActions,
} from '../actions/song';

interface ISongState {
  songs: ISong[];
}

const initialState: ISongState = {
  songs: [],
}

export function songReducer(state = initialState, action: TrackActions): ISongState {
  switch (action.type) {
    case ADD_TRACK:
      return {
        ...state,
        songs: [...state.songs, action.track]
      };
    case DELETE_TRACK:
      const newPlaylist = state.songs.filter(s => s.id !== action.track.id);
      return {
        ...state,
        songs: newPlaylist,
      }
    case LOAD_TRACKS:
      return {
        ...state,
        songs: action.tracks
      }
    default:
      return state;
  }
}

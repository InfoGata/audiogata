import { v4 as uuid } from "uuid";
import { ISong } from '../../services/data/database';
import {
  ADD_TRACK,
  CLEAR_TRACKS,
  DELETE_TRACK,
  SET_TRACKS,
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
      const id = uuid();
      action.track.id = id;
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
    case CLEAR_TRACKS:
      return {
        ...state,
        songs: []
      }
    case SET_TRACKS:
      return {
        ...state,
        songs: action.tracks
      }
    default:
      return state;
  }
}

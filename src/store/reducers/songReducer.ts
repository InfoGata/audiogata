import { ISong } from '../../services/data/database';
import {
  ADD_TRACK,
  DELETE_TRACK,
  LOAD_TRACKS,
  SET_TRACK,
  TrackActions,
} from '../actions/song';

interface ISongState {
  songs: ISong[];
  currentIndex: number;
  currentSong?: ISong;
}

const initialState: ISongState = {
  currentIndex: -1,
  songs: [],
}

export function songReducer(state = initialState, action: TrackActions): ISongState {
  switch (action.type) {
    case ADD_TRACK:
      return {
        ...state,
        songs: [...state.songs, action.track]
      };
    case SET_TRACK:
      const index = state.songs.findIndex(s => s === action.track);
      return {
        ...state,
        currentIndex: index,
        currentSong: action.track,
      }
    case DELETE_TRACK:
      const newPlaylist = state.songs.filter(s => s.id !== action.track.id);
      const currentIndex = newPlaylist.findIndex(
        s => s.id === (state.currentSong ? state.currentSong.id : -1),
      );
      return {
        ...state,
        currentIndex,
        currentSong: action.track,
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

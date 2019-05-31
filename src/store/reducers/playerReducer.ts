import { ISong } from "../../services/data/database";
import { PlayerActionTypes, SET_TRACK, TOGGLE_REPEAT, TOGGLE_SHUFFLE } from "../actions/player";

interface IPlayerState {
  shuffle: boolean;
  repeat: boolean;
  currentSong?: ISong;
}
const initialState: IPlayerState = {
  repeat: false,
  shuffle: false,
}

export function playerReducer(state = initialState, action: PlayerActionTypes): IPlayerState {
  switch (action.type) {
    case TOGGLE_SHUFFLE:
      return {
        ...state,
        shuffle: !state.shuffle,
      }
    case TOGGLE_REPEAT:
      return {
        ...state,
        repeat: !state.repeat,
      }
    case SET_TRACK:
      return {
        ...state,
        currentSong: action.track,
      }
    default:
      return state;
  }
}
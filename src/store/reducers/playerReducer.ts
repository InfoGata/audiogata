import { PlayerActionTypes, TOGGLE_REPEAT, TOGGLE_SHUFFLE } from "../actions/player";

interface IPlayerState {
  shuffle: boolean;
  repeat: boolean;
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
    default:
      return state;
  }
}
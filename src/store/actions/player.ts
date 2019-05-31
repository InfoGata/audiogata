import { ISong } from "../../services/data/database";

export const TOGGLE_SHUFFLE = "TOGGLE_SHUFFLE";
export const TOGGLE_REPEAT = "TOGGLE_REPEAT";
export const TOGGLE_MUTE = "TOGGLE_MUTE";
export const SET_TRACK = "SET_TRACK";

interface IToggleShuffle {
  type: typeof TOGGLE_SHUFFLE;
}
export function toggleShuffle(): IToggleShuffle {
  return {
    type: TOGGLE_SHUFFLE,
  };
}

interface IToggleRepeat {
  type: typeof TOGGLE_REPEAT;
}
export function toggleRepeat(): IToggleRepeat {
  return {
    type: TOGGLE_REPEAT,
  };
}

interface IToggleMute {
  type: typeof TOGGLE_MUTE;
}
export function toggleMute(): IToggleMute {
  return {
    type: TOGGLE_MUTE,
  };
}

interface ISetTrack {
  type: typeof SET_TRACK;
  track?: ISong;
}

export function setTrack(track?: ISong): ISetTrack {
  return {
    track,
    type: SET_TRACK,
  };
}

export type PlayerActionTypes = IToggleShuffle | IToggleRepeat | IToggleMute | ISetTrack;

export const TOGGLE_SHUFFLE = "TOGGLE_SHUFFLE";
export const TOGGLE_REPEAT = "TOGGLE_REPEAT";

interface IToggleShuffle {
  type: typeof TOGGLE_SHUFFLE;
}
export function toggleShuffle() {
  return {
    type: TOGGLE_SHUFFLE,
  };
}

interface IToggleRepeat {
  type: typeof TOGGLE_REPEAT;
}
export function toggleRepeat() {
  return {
    type: TOGGLE_REPEAT,
  };
}

export type PlayerActionTypes = IToggleShuffle | IToggleRepeat;

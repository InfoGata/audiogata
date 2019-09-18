import { createSlice, PayloadAction } from "redux-starter-kit";
import { ISong } from "../../services/data/database";

interface IPlayerState {
  shuffle: boolean;
  repeat: boolean;
  currentSong?: ISong;
}
const initialState: IPlayerState = {
  repeat: false,
  shuffle: false,
}

const playerSlice = createSlice({
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<ISong | undefined>) => {
      return {
        ...state,
        currentSong: action.payload,
      }
    },
    toggleRepeat: (state) => {
      return {
        ...state,
        repeat: !state.repeat,
      }
    },
    toggleShuffle: (state) => {
      return {
        ...state,
        shuffle: !state.shuffle,
      }
    },
  },
  slice: 'player',
});

export const { setTrack, toggleRepeat, toggleShuffle } = playerSlice.actions;
export default playerSlice.reducer;

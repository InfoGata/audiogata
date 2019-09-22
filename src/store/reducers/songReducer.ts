import { createSlice, PayloadAction } from "redux-starter-kit";
import { v4 as uuid } from "uuid";
import { ISong } from "../../models";

interface ISongState {
  songs: ISong[];
  shuffle: boolean;
  repeat: boolean;
  currentSong?: ISong;
}

const initialState: ISongState = {
  repeat: false,
  shuffle: false,
  songs: [],
}

const songSlice = createSlice({
  initialState,
  reducers: {
    addTrack(state, action: PayloadAction<ISong>) {
      const id = uuid();
      action.payload.id = id;
      return {
        ...state,
        songs: [...state.songs, action.payload]
      };
    },
    clearTracks(state) {
      return {
        ...state,
        songs: []
      };
    },
    deleteTrack(state, action: PayloadAction<ISong>) {
      const newPlaylist = state.songs.filter(s => s.id !== action.payload.id);
      return {
        ...state,
        songs: newPlaylist,
      }
    },
    setTracks(state, action: PayloadAction<ISong[]>) {
      return {
        ...state,
        songs: action.payload
      }
    },
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
  slice: "song"
});

export const {
  setTracks,
  clearTracks,
  deleteTrack,
  addTrack,
  setTrack,
  toggleRepeat,
  toggleShuffle
} = songSlice.actions;
export default songSlice.reducer;

import { createSlice, PayloadAction } from "redux-starter-kit";
import { v4 as uuid } from "uuid";
import { ISong } from "../../models";

interface ISongState {
  songs: ISong[];
  shuffleList: number[];
  shuffle: boolean;
  repeat: boolean;
  currentSong?: ISong;
}

const initialState: ISongState = {
  repeat: false,
  shuffle: false,
  shuffleList: [],
  songs: [],
}

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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
        shuffleList: [],
        songs: []
      };
    },
    deleteTrack(state, action: PayloadAction<ISong>) {
      const newPlaylist = state.songs.filter(s => s.id !== action.payload.id);
      return {
        ...state,
        shuffleList: [],
        songs: newPlaylist,
      }
    },
    dequeueShuffleList: (state) => {
      state.shuffleList.shift();
    },
    setTracks(state, action: PayloadAction<ISong[]>) {
      return {
        ...state,
        shuffleList: [],
        songs: action.payload
      }
    },
    setShuffleList: (state) => {
      const indexArray = Object.keys(state.songs).map(Number);
      shuffleArray(indexArray);
      return {
        ...state,
        shuffleList: indexArray
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
        shuffleList: [],
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
  setShuffleList,
  setTrack,
  toggleRepeat,
  toggleShuffle,
  dequeueShuffleList
} = songSlice.actions;
export default songSlice.reducer;

import { createSlice, PayloadAction } from "redux-starter-kit";
import { v4 as uuid } from "uuid";
import { ISong } from '../../services/data/database';

interface ISongState {
  songs: ISong[];
}

const initialState: ISongState = {
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
    }
  },
  slice: "song"
});

export const { setTracks, clearTracks, deleteTrack, addTrack } = songSlice.actions;
export default songSlice.reducer;

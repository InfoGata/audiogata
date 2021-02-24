import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { IPlaylist, ISong } from "../../models";

interface IPlaylistState {
  playlists: IPlaylist[];
}

const initialState: IPlaylistState = {
  playlists: []
}

interface IAddSongs {
  id: string;
  songs: ISong[];
}

const prepareAddSongs = (id: string, songs: ISong[]) => ({
  payload: {
    id,
    songs
  }
});

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    addPlaylist(state, action: PayloadAction<IPlaylist>) {
      const id = uuid();
      action.payload.id = id;
      return {
        ...state,
        playlists: [...state.playlists, action.payload]
      };
    },
    deletePlaylist(state, action: PayloadAction<IPlaylist>) {
      return {
        ...state,
        playlists: state.playlists.filter(p => p.id !== action.payload.id)
      };
    },
    addSongs: {
      prepare: prepareAddSongs,
      reducer: (state, action: PayloadAction<IAddSongs>) => {
        return {
          ...state,
          playlists: state.playlists.map(p =>
            p.id === action.payload.id ? { ...p, songs: p.songs.concat(action.payload.songs) } : p)
        };
      }
    },
    setSongs: {
      prepare: prepareAddSongs,
      reducer: (state, action: PayloadAction<IAddSongs>) => {
        return {
          ...state,
          playlists: state.playlists.map(p =>
            p.id === action.payload.id ? { ...p, songs: action.payload.songs } : p)
        };
      }
    }
  },
});

export const { setSongs, addSongs, addPlaylist, deletePlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { IPlaylist, ISong, PlaylistInfo } from "../../types";
import { AppActionCreator } from "../store";
import { db } from "../../database";

interface IPlaylistState {
  playlists: PlaylistInfo[];
}

const initialState: IPlaylistState = {
  playlists: [],
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    initialize(state, action: PayloadAction<PlaylistInfo[]>) {
      return {
        ...state,
        playlists: action.payload,
      };
    },
    addPlaylist(state, action: PayloadAction<PlaylistInfo>) {
      return {
        ...state,
        playlists: [...state.playlists, action.payload],
      };
    },
    deletePlaylist(state, action: PayloadAction<PlaylistInfo>) {
      return {
        ...state,
        playlists: state.playlists.filter((p) => p.id !== action.payload.id),
      };
    },
  },
});

export const initializePlaylists: AppActionCreator = () => async (dispatch) => {
  const playlists = await db.playlists.toArray();
  const info: PlaylistInfo[] = await playlists.map((p) => ({
    id: p.id,
    name: p.name,
    images: p.images,
  }));
  dispatch(playlistSlice.actions.initialize(info));
};

export const addPlaylist: AppActionCreator =
  (playlist: IPlaylist) => async (dispatch) => {
    const id = nanoid();
    playlist.id = id;
    await db.playlists.add(playlist);
    const info: PlaylistInfo = {
      id: playlist.id,
      images: playlist.images,
      name: playlist.name,
    };
    dispatch(playlistSlice.actions.addPlaylist(info));
  };

export const deletePlaylist: AppActionCreator =
  (playlist: PlaylistInfo) => async (dispatch) => {
    if (playlist.id) {
      await db.playlists.delete(playlist.id);
      dispatch(playlistSlice.actions.deletePlaylist(playlist));
    }
  };

export const setPlaylistTracks: AppActionCreator =
  (playlist: IPlaylist, tracks: ISong[]) => async (_dispatch) => {
    playlist.songs = tracks;
    await db.playlists.put(playlist);
  };

export const addPlaylistTracks: AppActionCreator =
  (playlistInfo: PlaylistInfo, tracks: ISong[]) => async (_dispatch) => {
    const playlist = await db.playlists.get(playlistInfo.id || "");
    if (playlist) {
      const newTracks = playlist.songs.concat(tracks);
      playlist.songs = newTracks;
      await db.playlists.put(playlist);
    }
  };

export default playlistSlice.reducer;

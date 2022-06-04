import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { IPlaylist, Track, PlaylistInfo } from "../../types";
import { AppActionCreator } from "../store";
import { db } from "../../database";

interface PlaylistState {
  playlists: PlaylistInfo[];
}

const initialState: PlaylistState = {
  playlists: [],
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    setPlaylists(state, action: PayloadAction<PlaylistInfo[]>) {
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

const playlistToPlaylistInfo = (playlist: IPlaylist): PlaylistInfo => ({
  id: playlist.id,
  name: playlist.name,
  images: playlist.images,
});

export const initializePlaylists: AppActionCreator = () => async (dispatch) => {
  const playlists = await db.playlists.toArray();
  const info = playlists.map(playlistToPlaylistInfo);
  dispatch(playlistSlice.actions.setPlaylists(info));
};

export const addPlaylist: AppActionCreator =
  (playlist: IPlaylist) => async (dispatch) => {
    const id = nanoid();
    playlist.id = id;
    await db.playlists.add(playlist);
    const info: PlaylistInfo = playlistToPlaylistInfo(playlist);
    dispatch(playlistSlice.actions.addPlaylist(info));
  };

export const addPlaylists: AppActionCreator =
  (playlists: IPlaylist[]) => async (dispatch) => {
    await db.playlists.bulkPut(playlists);
    const newPlaylists = await db.playlists.toArray();
    const info = newPlaylists.map(playlistToPlaylistInfo);
    dispatch(playlistSlice.actions.setPlaylists(info));
  };

export const deletePlaylist: AppActionCreator =
  (playlist: PlaylistInfo) => async (dispatch) => {
    if (playlist.id) {
      await db.playlists.delete(playlist.id);
      dispatch(playlistSlice.actions.deletePlaylist(playlist));
    }
  };

export const setPlaylistTracks: AppActionCreator =
  (playlist: IPlaylist, tracks: Track[]) => async (_dispatch) => {
    playlist.tracks = tracks;
    await db.playlists.put(playlist);
  };

export const addPlaylistTracks: AppActionCreator =
  (playlistInfo: PlaylistInfo, tracks: Track[]) => async (_dispatch) => {
    const playlist = await db.playlists.get(playlistInfo.id || "");
    if (playlist) {
      const newTracks = playlist.tracks.concat(tracks);
      playlist.tracks = newTracks;
      await db.playlists.put(playlist);
    }
  };

export default playlistSlice.reducer;

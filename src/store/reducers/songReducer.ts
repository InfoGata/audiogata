import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { Song } from "../../types";
import { getPluginFrames } from "../../PluginsContext";
import { filterAsync } from "../../utils";
import { AppActionCreator } from "../store";

interface SongState {
  songs: Song[];
  shuffleList: number[];
  shuffle: boolean;
  repeat: boolean;
  currentSong?: Song;
  elapsed?: number;
  isPlaying: boolean;
  volume: number;
  mute: boolean;
  seekTime?: number;
  playbackRate?: number;
}

interface UpdateFrom {
  updateIds: Set<string>;
  from: string;
}

const initialState: SongState = {
  isPlaying: false,
  mute: false,
  repeat: false,
  shuffle: false,
  shuffleList: [],
  songs: [],
  volume: 1.0,
  playbackRate: 1.0,
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
const createShuffleArray = (tracks: Song[]): number[] => {
  const indexArray = Object.keys(tracks).map(Number);
  shuffleArray(indexArray);
  return indexArray;
};

const songSlice = createSlice({
  name: "song",
  initialState,
  reducers: {
    addTrack(state, action: PayloadAction<Song>): SongState {
      return {
        ...state,
        songs: [...state.songs, action.payload],
      };
    },
    clearTracks(state): SongState {
      return {
        ...state,
        shuffleList: [],
        songs: [],
      };
    },
    deleteTrack(state, action: PayloadAction<Song>): SongState {
      const newPlaylist = state.songs.filter((s) => s.id !== action.payload.id);
      let currentSong = state.currentSong;
      if (currentSong && currentSong.id === action.payload.id) {
        currentSong = undefined;
      }
      return {
        ...state,
        currentSong,
        shuffleList: [],
        songs: newPlaylist,
      };
    },
    updateTrack(state, action: PayloadAction<Song>): SongState {
      return {
        ...state,
        songs: state.songs.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    },
    updateFrom(state, action: PayloadAction<UpdateFrom>): SongState {
      return {
        ...state,
        songs: state.songs.map((s) =>
          action.payload.updateIds.has(s.id || "")
            ? { ...s, from: action.payload.from }
            : s
        ),
      };
    },
    setTracks(state, action: PayloadAction<Song[]>): SongState {
      return {
        ...state,
        shuffleList: [],
        songs: action.payload,
      };
    },
    nextTrack: (state): SongState => {
      let shuffleList = [...state.shuffleList];
      let index = -1;
      if (state.currentSong) {
        const prevSong = state.currentSong;
        index = state.songs.findIndex((s) => s.id === prevSong.id);
      }
      let newIndex = index + 1;
      if (state.shuffle) {
        if (shuffleList.length === 0) {
          shuffleList = createShuffleArray(state.songs);
        }
        newIndex = shuffleList.shift() || 0;
      }
      if (newIndex > state.songs.length) {
        newIndex = 0;
      }
      const currentSong = state.songs[newIndex];
      if (
        currentSong &&
        state.currentSong &&
        currentSong.id === state.currentSong.id
      ) {
        return {
          ...state,
          elapsed: 0,
          isPlaying: true,
          seekTime: 0,
          shuffleList,
        };
      }
      return {
        ...state,
        currentSong,
        elapsed: 0,
        shuffleList,
      };
    },
    prevTrack: (state): SongState => {
      if (state.elapsed && state.elapsed > 2) {
        return {
          ...state,
          seekTime: 0,
        };
      }

      let index = -1;
      if (state.currentSong) {
        const prevSong = state.currentSong;
        index = state.songs.findIndex((s) => s.id === prevSong.id);
      }
      let newIndex = index - 1;
      if (newIndex < 0) {
        newIndex = state.songs.length - 1;
      }
      const currentSong = state.songs[newIndex];
      return {
        ...state,
        currentSong,
        elapsed: 0,
      };
    },
    seek: (state, action: PayloadAction<number | undefined>): SongState => {
      return {
        ...state,
        elapsed: action.payload,
        seekTime: action.payload,
      };
    },
    setElapsed: (state, action: PayloadAction<number>): SongState => {
      return {
        ...state,
        elapsed: action.payload,
      };
    },
    setTrack: (state, action: PayloadAction<Song | undefined>): SongState => {
      if (
        state.currentSong &&
        action.payload &&
        state.currentSong.id === action.payload.id
      ) {
        return {
          ...state,
          elapsed: 0,
          isPlaying: true,
          seekTime: 0,
        };
      }
      return {
        ...state,
        currentSong: action.payload,
        elapsed: 0,
        isPlaying: true,
      };
    },
    setVolume: (state, action: PayloadAction<number>): SongState => {
      return {
        ...state,
        mute: false,
        volume: action.payload,
      };
    },
    setPlaybackRate: (state, action: PayloadAction<number>): SongState => {
      return {
        ...state,
        playbackRate: action.payload,
      };
    },
    toggleIsPlaying: (state): SongState => {
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    },
    toggleMute: (state): SongState => {
      return {
        ...state,
        mute: !state.mute,
      };
    },
    toggleRepeat: (state): SongState => {
      return {
        ...state,
        repeat: !state.repeat,
      };
    },
    toggleShuffle: (state): SongState => {
      return {
        ...state,
        shuffle: !state.shuffle,
        shuffleList: [],
      };
    },
  },
});

export const addTrack: AppActionCreator = (track: Song) => async (dispatch) => {
  const plugins = getPluginFrames();
  const id = nanoid();
  track.id = id;
  dispatch(songSlice.actions.addTrack(track));
  const filteredPlugins = await filterAsync(plugins, (p) =>
    p.hasDefined.onNowPlayingTracksAdded()
  );
  await Promise.all(
    filteredPlugins.map((p) => p.remote.onNowPlayingTracksAdded([track]))
  );
};

export const deleteTrack: AppActionCreator =
  (track: Song) => async (dispatch) => {
    const plugins = getPluginFrames();
    dispatch(songSlice.actions.deleteTrack(track));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksRemoved()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksRemoved([track]))
    );
  };

export const updateTrack: AppActionCreator =
  (track: Song) => async (dispatch) => {
    const plugins = getPluginFrames();
    dispatch(songSlice.actions.updateTrack(track));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksChanged()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksChanged([track]))
    );
  };

export const clearTracks: AppActionCreator =
  () => async (dispatch, getState) => {
    const state = getState();
    const plugins = getPluginFrames();
    dispatch(songSlice.actions.clearTracks());
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksRemoved()
    );
    await Promise.all(
      filteredPlugins.map((p) =>
        p.remote.onNowPlayingTracksRemoved(state.song.songs)
      )
    );
  };

export const setTracks: AppActionCreator =
  (tracks: Song[]) => async (dispatch) => {
    const plugins = getPluginFrames();
    dispatch(songSlice.actions.setTracks(tracks));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksSet()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksSet(tracks))
    );
  };

export const {
  setTrack,
  toggleRepeat,
  toggleShuffle,
  setElapsed,
  setVolume,
  setPlaybackRate,
  toggleMute,
  nextTrack,
  prevTrack,
  toggleIsPlaying,
  seek,
  updateFrom,
} = songSlice.actions;
export default songSlice.reducer;

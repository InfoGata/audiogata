import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { Track } from "../../plugintypes";
import { getPluginFrames } from "../../PluginsContext";
import { filterAsync } from "../../utils";
import { AppThunk } from "../store";

interface TrackState {
  tracks: Track[];
  shuffleList: number[];
  shuffle: boolean;
  repeat: boolean;
  currentTrack?: Track;
  elapsed?: number;
  isPlaying: boolean;
  volume: number;
  mute: boolean;
  seekTime?: number;
  playbackRate?: number;
}

const initialState: TrackState = {
  isPlaying: false,
  mute: false,
  repeat: false,
  shuffle: false,
  shuffleList: [],
  tracks: [],
  volume: 1.0,
  playbackRate: 1.0,
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
const createShuffleArray = (tracks: Track[]): number[] => {
  const indexArray = Object.keys(tracks).map(Number);
  shuffleArray(indexArray);
  return indexArray;
};

const trackSlice = createSlice({
  name: "track",
  initialState,
  reducers: {
    addTrack(state, action: PayloadAction<Track>): TrackState {
      return {
        ...state,
        tracks: [...state.tracks, action.payload],
      };
    },
    addTracks(state, action: PayloadAction<Track[]>): TrackState {
      const newTracks = state.tracks.concat(action.payload);
      return {
        ...state,
        tracks: newTracks,
      };
    },
    clearTracks(state): TrackState {
      return {
        ...state,
        shuffleList: [],
        tracks: [],
        currentTrack: undefined,
        elapsed: 0,
      };
    },
    deleteTrack(state, action: PayloadAction<Track>): TrackState {
      const newPlaylist = state.tracks.filter(
        (t) => t.id !== action.payload.id
      );
      let currentTrack = state.currentTrack;
      if (currentTrack && currentTrack.id === action.payload.id) {
        currentTrack = undefined;
      }
      return {
        ...state,
        currentTrack: currentTrack,
        shuffleList: [],
        tracks: newPlaylist,
      };
    },
    deleteTracks(state, action: PayloadAction<Set<string>>): TrackState {
      const newPlaylist = state.tracks.filter(
        (t) => !action.payload.has(t.id ?? "")
      );
      let currentTrack = state.currentTrack;
      if (currentTrack && action.payload.has(currentTrack.id ?? "")) {
        currentTrack = undefined;
      }
      return {
        ...state,
        currentTrack,
        shuffleList: [],
        tracks: newPlaylist,
      };
    },
    updateTrack(state, action: PayloadAction<Track>): TrackState {
      return {
        ...state,
        tracks: state.tracks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    },
    setTracks(state, action: PayloadAction<Track[]>): TrackState {
      return {
        ...state,
        shuffleList: [],
        tracks: action.payload,
      };
    },
    nextTrack: (state): TrackState => {
      let shuffleList = [...state.shuffleList];
      let index = -1;
      if (state.currentTrack) {
        const prevTrack = state.currentTrack;
        index = state.tracks.findIndex((t) => t.id === prevTrack.id);
      }
      let newIndex = index + 1;
      if (state.shuffle) {
        if (shuffleList.length === 0) {
          shuffleList = createShuffleArray(state.tracks);
        }
        newIndex = shuffleList.shift() || 0;
      }
      if (newIndex > state.tracks.length) {
        newIndex = 0;
      }
      const nextTrack = state.tracks[newIndex];
      if (
        nextTrack &&
        state.currentTrack &&
        nextTrack.id === state.currentTrack.id
      ) {
        return {
          ...state,
          elapsed: 0,
          isPlaying: true,
          seekTime: 0,
          shuffleList,
        };
      } else if (!nextTrack) {
        return {
          ...state,
          elapsed: 0,
          isPlaying: false,
          seekTime: 0,
          shuffleList,
          currentTrack: undefined,
        };
      }
      return {
        ...state,
        currentTrack: nextTrack,
        elapsed: 0,
        shuffleList,
      };
    },
    prevTrack: (state): TrackState => {
      if (state.elapsed && state.elapsed > 2) {
        return {
          ...state,
          seekTime: 0,
        };
      }

      let index = -1;
      if (state.currentTrack) {
        const prevTrack = state.currentTrack;
        index = state.tracks.findIndex((t) => t.id === prevTrack.id);
      }
      let newIndex = index - 1;
      if (newIndex < 0) {
        newIndex = state.tracks.length - 1;
      }
      const currentTrack = state.tracks[newIndex];
      return {
        ...state,
        currentTrack: currentTrack,
        elapsed: 0,
      };
    },
    seek: (state, action: PayloadAction<number | undefined>): TrackState => {
      return {
        ...state,
        elapsed: action.payload,
        seekTime: action.payload,
      };
    },
    setElapsed: (state, action: PayloadAction<number>): TrackState => {
      return {
        ...state,
        elapsed: action.payload,
      };
    },
    setTrack: (state, action: PayloadAction<Track | undefined>): TrackState => {
      if (
        state.currentTrack &&
        action.payload &&
        state.currentTrack.id === action.payload.id
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
        currentTrack: action.payload,
        elapsed: 0,
        isPlaying: true,
      };
    },
    playQueue: (state): TrackState => {
      let newIndex = 0;
      let shuffleList = [...state.shuffleList];
      if (state.shuffle) {
        if (shuffleList.length === 0) {
          shuffleList = createShuffleArray(state.tracks);
        }
        newIndex = shuffleList.shift() || 0;
      }
      const track = state.tracks[newIndex];
      return {
        ...state,
        currentTrack: track,
        elapsed: 0,
        isPlaying: true,
        shuffleList,
      };
    },
    setVolume: (state, action: PayloadAction<number>): TrackState => {
      return {
        ...state,
        mute: false,
        volume: action.payload,
      };
    },
    setPlaybackRate: (state, action: PayloadAction<number>): TrackState => {
      return {
        ...state,
        playbackRate: action.payload,
      };
    },
    toggleIsPlaying: (state): TrackState => {
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    },
    toggleMute: (state): TrackState => {
      return {
        ...state,
        mute: !state.mute,
      };
    },
    toggleRepeat: (state): TrackState => {
      return {
        ...state,
        repeat: !state.repeat,
      };
    },
    toggleShuffle: (state): TrackState => {
      return {
        ...state,
        shuffle: !state.shuffle,
        shuffleList: [],
      };
    },
  },
});

export const addTrack =
  (track: Track): AppThunk =>
  async (dispatch) => {
    const plugins = getPluginFrames();
    if (!track.id) {
      const id = nanoid();
      track.id = id;
    }
    dispatch(trackSlice.actions.addTrack(track));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksAdded()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksAdded([track]))
    );
  };

export const addTracks =
  (tracks: Track[]): AppThunk =>
  async (dispatch) => {
    const plugins = getPluginFrames();
    dispatch(trackSlice.actions.addTracks(tracks));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksAdded()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksAdded(tracks))
    );
  };

export const deleteTrack =
  (track: Track): AppThunk =>
  async (dispatch) => {
    const plugins = getPluginFrames();
    dispatch(trackSlice.actions.deleteTrack(track));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksRemoved()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksRemoved([track]))
    );
  };

export const deleteTracks =
  (tracksIds: Set<string>): AppThunk =>
  async (dispatch, getState) => {
    const plugins = getPluginFrames();
    dispatch(trackSlice.actions.deleteTracks(tracksIds));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksRemoved()
    );
    if (filteredPlugins.length > 0) {
      const state = getState();
      const tracks = state.track.tracks.filter((t) =>
        tracksIds.has(t.id ?? "")
      );
      await Promise.all(
        filteredPlugins.map((p) => p.remote.onNowPlayingTracksRemoved(tracks))
      );
    }
  };

export const updateTrack =
  (track: Track): AppThunk =>
  async (dispatch) => {
    const plugins = getPluginFrames();
    dispatch(trackSlice.actions.updateTrack(track));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksChanged()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksChanged([track]))
    );
  };

export const clearTracks = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const plugins = getPluginFrames();
  dispatch(trackSlice.actions.clearTracks());
  const filteredPlugins = await filterAsync(plugins, (p) =>
    p.hasDefined.onNowPlayingTracksRemoved()
  );
  await Promise.all(
    filteredPlugins.map((p) =>
      p.remote.onNowPlayingTracksRemoved(state.track.tracks)
    )
  );
};

export const setTracks =
  (tracks: Track[]): AppThunk =>
  async (dispatch) => {
    const plugins = getPluginFrames();
    dispatch(trackSlice.actions.setTracks(tracks));
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
  playQueue,
} = trackSlice.actions;
export default trackSlice.reducer;

import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import intersectionBy from "lodash/intersectionBy";
import callConfig from "../../call-config";
import { localPlayer } from "../../LocalPlayer";
import { PluginFrameContainer } from "../../PluginsContext";
import { Track } from "../../plugintypes";
import { defaultSkipTime, filterAsync, mergeTracks } from "../../utils";
import { AppDispatch, AppThunk } from "../store";

interface TrackState {
  tracks: Track[];
  shuffleList: number[];
  shuffle: boolean;
  repeat: boolean;
  repeatOne?: boolean;
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
  repeatOne: false,
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
      if (state.shuffle && !state.repeatOne) {
        if (shuffleList.length === 0) {
          shuffleList = createShuffleArray(state.tracks);
        }
        newIndex = shuffleList.shift() || 0;
      }
      if (state.repeat && newIndex >= state.tracks.length) {
        newIndex = 0;
      }
      const nextTrack = state.tracks[newIndex];
      if (
        (nextTrack &&
          state.currentTrack &&
          nextTrack.id === state.currentTrack.id) ||
        state.repeatOne
      ) {
        return {
          ...state,
          isPlaying: true,
          seekTime: 0,
          shuffleList,
        };
      } else if (!nextTrack) {
        return {
          ...state,
          elapsed: 0,
          isPlaying: false,
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
      if (
        (currentTrack &&
          state.currentTrack &&
          currentTrack.id === state.currentTrack.id) ||
        state.repeatOne
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
    pause: (state): TrackState => {
      return {
        ...state,
        isPlaying: false,
      };
    },
    play: (state): TrackState => {
      return {
        ...state,
        isPlaying: true,
      };
    },
    toggleMute: (state): TrackState => {
      return {
        ...state,
        mute: !state.mute,
      };
    },
    changeRepeat: (state) => {
      if (state.repeatOne) {
        state.repeatOne = false;
        state.repeat = false;
        return;
      }

      if (state.repeat && !state.repeatOne) {
        state.repeatOne = true;
        return;
      }

      if (!state.repeat) {
        state.repeat = true;
        return;
      }
    },
    toggleShuffle: (state): TrackState => {
      return {
        ...state,
        shuffle: !state.shuffle,
        shuffleList: [],
      };
    },
    fastFoward: (state, action: PayloadAction<number>): TrackState => {
      const seconds = action.payload;
      const newTime = (state.elapsed || 0) + seconds;
      return {
        ...state,
        seekTime: newTime,
      };
    },
    rewind: (state, action: PayloadAction<number>): TrackState => {
      const seconds = action.payload;
      const newTime = (state.elapsed || 0) - seconds;
      return {
        ...state,
        seekTime: Math.max(0, newTime),
      };
    },
  },
});

export const fastFoward = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const seconds = state.settings.customFowardAndRewindTime || defaultSkipTime;
  dispatch(trackSlice.actions.fastFoward(seconds));
};

export const rewind = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const seconds = state.settings.customFowardAndRewindTime || defaultSkipTime;
  dispatch(trackSlice.actions.rewind(seconds));
};

export const addTrack =
  (track: Track): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const plugins = callConfig.call.usePlugins?.plugins || [];
    if (!track.id) {
      const id = nanoid();
      track.id = id;
    }
    const newTracks = mergeTracks(state.track.tracks, [track]);
    dispatch(trackSlice.actions.setTracks(newTracks));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksAdded()
    );
    if (filteredPlugins.length > 0) {
      const addedTracks = intersectionBy(state.track.tracks, newTracks, "id");
      if (addedTracks.length > 0) {
        await Promise.all(
          filteredPlugins.map((p) =>
            p.remote.onNowPlayingTracksAdded(addedTracks)
          )
        );
      }
    }
  };

export const addTracks =
  (tracks: Track[]): AppThunk =>
  async (dispatch, getState) => {
    const plugins = callConfig.call.usePlugins?.plugins || [];
    const state = getState();
    const newTracks = mergeTracks(state.track.tracks, tracks);
    dispatch(trackSlice.actions.setTracks(newTracks));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksAdded()
    );
    if (filteredPlugins.length > 0) {
      const addedTracks = intersectionBy(state.track.tracks, newTracks, "id");
      if (addedTracks.length > 0) {
        await Promise.all(
          filteredPlugins.map((p) => p.remote.onNowPlayingTracksAdded(tracks))
        );
      }
    }
  };

export const deleteTrack =
  (track: Track): AppThunk =>
  async (dispatch, getState) => {
    const plugins = callConfig.call.usePlugins?.plugins || [];
    const state = getState();
    const currentTrack = state.track.currentTrack;
    if (currentTrack && currentTrack.id === track.id) {
      await pauseDeletedTrack(dispatch, plugins, currentTrack);
    }
    dispatch(trackSlice.actions.deleteTrack(track));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksRemoved()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksRemoved([track]))
    );
  };

const pauseDeletedTrack = async (
  dispatch: AppDispatch,
  plugins: PluginFrameContainer[],
  currentTrack?: Track
) => {
  const plugin = plugins.find((p) => p.id === currentTrack?.pluginId);
  try {
    if (plugin && (await plugin?.hasDefined.onPause())) {
      await plugin.remote.onPause();
    }
    await localPlayer.onPause();
  } catch {
    /* empty */
  }
  dispatch(trackSlice.actions.pause());
};

export const deleteTracks =
  (tracksIds: Set<string>): AppThunk =>
  async (dispatch, getState) => {
    const plugins = callConfig.call.usePlugins?.plugins || [];
    const state = getState();
    const currentTrack = state.track.currentTrack;
    if (currentTrack?.id && tracksIds.has(currentTrack.id)) {
      await pauseDeletedTrack(dispatch, plugins, currentTrack);
    }
    dispatch(trackSlice.actions.deleteTracks(tracksIds));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksRemoved()
    );
    if (filteredPlugins.length > 0) {
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
    const plugins = callConfig.call.usePlugins?.plugins || [];
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
  const plugins = callConfig.call.usePlugins?.plugins || [];
  if (state.track.isPlaying) {
    pauseDeletedTrack(dispatch, plugins, state.track.currentTrack);
  }
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
    const plugins = callConfig.call.usePlugins?.plugins || [];
    dispatch(trackSlice.actions.setTracks(tracks));
    const filteredPlugins = await filterAsync(plugins, (p) =>
      p.hasDefined.onNowPlayingTracksSet()
    );
    await Promise.all(
      filteredPlugins.map((p) => p.remote.onNowPlayingTracksSet(tracks))
    );
  };

export const setElapsed =
  (elapsed: number): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    if (
      navigator.mediaSession &&
      "setPositionState" in navigator.mediaSession &&
      state.track.currentTrack?.duration
    ) {
      const actualElapsed = Math.min(
        elapsed,
        state.track.currentTrack.duration
      );
      navigator.mediaSession.setPositionState({
        position: actualElapsed,
        duration: state.track.currentTrack.duration,
      });
    }

    dispatch(trackSlice.actions.setElapsed(elapsed));
  };

export const {
  setTrack,
  changeRepeat,
  toggleShuffle,
  setVolume,
  setPlaybackRate,
  toggleMute,
  nextTrack,
  prevTrack,
  toggleIsPlaying,
  seek,
  playQueue,
  pause,
  play,
} = trackSlice.actions;
export default trackSlice.reducer;

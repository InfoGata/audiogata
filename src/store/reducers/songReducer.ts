import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { ISong } from "../../models";

interface ISongState {
  songs: ISong[];
  shuffleList: number[];
  shuffle: boolean;
  repeat: boolean;
  currentSong?: ISong;
  elapsed?: number;
  isPlaying: boolean;
  volume: number;
  mute: boolean;
  seekTime?: number;
  playbackRate?: number;
}

const initialState: ISongState = {
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
const createShuffleArray = (tracks: ISong[]): number[] => {
  const indexArray = Object.keys(tracks).map(Number);
  shuffleArray(indexArray);
  return indexArray;
};

const songSlice = createSlice({
  name: "song",
  initialState,
  reducers: {
    addTrack(state, action: PayloadAction<ISong>): ISongState {
      const id = uuid();
      action.payload.id = id;
      return {
        ...state,
        songs: [...state.songs, action.payload],
      };
    },
    clearTracks(state): ISongState {
      return {
        ...state,
        shuffleList: [],
        songs: [],
      };
    },
    deleteTrack(state, action: PayloadAction<ISong>): ISongState {
      const newPlaylist = state.songs.filter(s => s.id !== action.payload.id);
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
    nextTrack: (state): ISongState => {
      let shuffleList = [...state.shuffleList];
      let index = -1;
      if (state.currentSong) {
        const prevSong = state.currentSong;
        index = state.songs.findIndex(s => s.id === prevSong.id);
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
    prevTrack: (state): ISongState => {
      if (state.elapsed && state.elapsed > 2) {
        return {
          ...state,
          seekTime: 0,
        };
      }

      let index = -1;
      if (state.currentSong) {
        const prevSong = state.currentSong;
        index = state.songs.findIndex(s => s.id === prevSong.id);
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
    seek: (state, action: PayloadAction<number | undefined>): ISongState => {
      return {
        ...state,
        elapsed: action.payload,
        seekTime: action.payload,
      };
    },
    setElapsed: (state, action: PayloadAction<number>): ISongState => {
      return {
        ...state,
        elapsed: action.payload,
      };
    },
    setTracks(state, action: PayloadAction<ISong[]>): ISongState {
      return {
        ...state,
        shuffleList: [],
        songs: action.payload,
      };
    },
    setTrack: (state, action: PayloadAction<ISong | undefined>): ISongState => {
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
    setVolume: (state, action: PayloadAction<number>): ISongState => {
      return {
        ...state,
        mute: false,
        volume: action.payload,
      };
    },
    setPlaybackRate: (state, action: PayloadAction<number>): ISongState => {
      return {
        ...state,
        playbackRate: action.payload,
      };
    },
    toggleIsPlaying: (state): ISongState => {
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    },
    toggleMute: (state): ISongState => {
      return {
        ...state,
        mute: !state.mute,
      };
    },
    toggleRepeat: (state): ISongState => {
      return {
        ...state,
        repeat: !state.repeat,
      };
    },
    toggleShuffle: (state): ISongState => {
      return {
        ...state,
        shuffle: !state.shuffle,
        shuffleList: [],
      };
    },
  }
});

export const {
  setTracks,
  clearTracks,
  deleteTrack,
  addTrack,
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
} = songSlice.actions;
export default songSlice.reducer;

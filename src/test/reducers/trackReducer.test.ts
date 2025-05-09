import { describe, expect, test, vi } from "vitest";
import trackReducer from "../../store/reducers/trackReducer";
import { Track } from "../../plugintypes";

// Mock the dependencies that might cause issues in tests
vi.mock("../../call-config", () => ({
  default: {
    call: {
      usePlugins: { plugins: [] }
    }
  }
}));

vi.mock("../../LocalPlayer", () => ({
  localPlayer: {
    onPause: vi.fn()
  }
}));

describe("trackReducer", () => {
  const initialState = {
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

  test("should return the initial state", () => {
    expect(trackReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  test("should handle clearTracks", () => {
    const previousState = {
      ...initialState,
      tracks: [{ id: "1", name: "Track 1" }],
      currentTrack: { id: "1", name: "Track 1" },
      elapsed: 10,
    };

    // Use the action creator directly to get the action object
    expect(trackReducer(previousState, { 
      type: "track/clearTracks"
    })).toEqual({
      ...previousState,
      tracks: [],
      currentTrack: undefined,
      elapsed: 0,
      shuffleList: [],
    });
  });

  test("should handle setTracks", () => {
    const tracks: Track[] = [
      { id: "1", name: "Track 1" },
      { id: "2", name: "Track 2" },
    ];

    expect(trackReducer(initialState, { 
      type: "track/setTracks", 
      payload: tracks
    })).toEqual({
      ...initialState,
      tracks,
      shuffleList: [],
    });
  });

  test("should handle deleteTrack", () => {
    const previousState = {
      ...initialState,
      tracks: [
        { id: "1", name: "Track 1" },
        { id: "2", name: "Track 2" },
      ],
      currentTrack: { id: "1", name: "Track 1" },
    };

    expect(trackReducer(previousState, { 
      type: "track/deleteTrack", 
      payload: { id: "1", name: "Track 1" }
    })).toEqual({
      ...previousState,
      tracks: [{ id: "2", name: "Track 2" }],
      currentTrack: undefined,
      shuffleList: [],
    });

    // Should keep currentTrack if deleted track has different id
    expect(trackReducer(previousState, { 
      type: "track/deleteTrack", 
      payload: { id: "2", name: "Track 2" }
    })).toEqual({
      ...previousState,
      tracks: [{ id: "1", name: "Track 1" }],
      currentTrack: { id: "1", name: "Track 1" },
      shuffleList: [],
    });
  });

  test("should handle setTrack", () => {
    const track: Track = { id: "1", name: "Track 1" };

    expect(trackReducer(initialState, { 
      type: "track/setTrack", 
      payload: track
    })).toEqual({
      ...initialState,
      currentTrack: track,
      elapsed: 0,
      isPlaying: true,
    });

    // If the same track is set again, it should reset elapsed and keep playing
    const stateWithTrack = {
      ...initialState,
      currentTrack: track,
      isPlaying: true,
      elapsed: 30,
    };

    expect(trackReducer(stateWithTrack, { 
      type: "track/setTrack", 
      payload: track
    })).toEqual({
      ...stateWithTrack,
      elapsed: 0,
      seekTime: 0,
      isPlaying: true,
    });
  });

  test("should handle toggleIsPlaying", () => {
    expect(trackReducer(initialState, { type: "track/toggleIsPlaying" })).toEqual({
      ...initialState,
      isPlaying: true,
    });

    const playingState = { ...initialState, isPlaying: true };
    expect(trackReducer(playingState, { type: "track/toggleIsPlaying" })).toEqual({
      ...playingState,
      isPlaying: false,
    });
  });

  test("should handle pause and play", () => {
    expect(trackReducer(initialState, { type: "track/pause" })).toEqual({
      ...initialState,
      isPlaying: false,
    });

    expect(trackReducer(initialState, { type: "track/play" })).toEqual({
      ...initialState,
      isPlaying: true,
    });
  });

  test("should handle toggleMute", () => {
    expect(trackReducer(initialState, { type: "track/toggleMute" })).toEqual({
      ...initialState,
      mute: true,
    });

    const mutedState = { ...initialState, mute: true };
    expect(trackReducer(mutedState, { type: "track/toggleMute" })).toEqual({
      ...mutedState,
      mute: false,
    });
  });

  test("should handle toggleShuffle", () => {
    expect(trackReducer(initialState, { type: "track/toggleShuffle" })).toEqual({
      ...initialState,
      shuffle: true,
      shuffleList: [],
    });

    const shuffleState = { 
      ...initialState, 
      shuffle: true, 
      shuffleList: [1, 2, 3] 
    };
    
    expect(trackReducer(shuffleState, { type: "track/toggleShuffle" })).toEqual({
      ...shuffleState,
      shuffle: false,
      shuffleList: [],
    });
  });

  test("should handle nextTrack with repeat", () => {
    const stateWithTracks = {
      ...initialState,
      tracks: [
        { id: "1", name: "Track 1" },
        { id: "2", name: "Track 2" },
      ],
      currentTrack: { id: "1", name: "Track 1" },
      repeat: true,
    };

    const result = trackReducer(stateWithTracks, { type: "track/nextTrack" });
    expect(result.currentTrack?.id).toBe("2");
    expect(result.elapsed).toBe(0);
  });

  test("should handle nextTrack at end of playlist with repeat", () => {
    const stateWithTracks = {
      ...initialState,
      tracks: [
        { id: "1", name: "Track 1" },
        { id: "2", name: "Track 2" },
      ],
      currentTrack: { id: "2", name: "Track 2" },
      repeat: true,
    };

    const result = trackReducer(stateWithTracks, { type: "track/nextTrack" });
    expect(result.currentTrack?.id).toBe("1");
    expect(result.elapsed).toBe(0);
  });

  test("should handle nextTrack at end of playlist without repeat", () => {
    const stateWithTracks = {
      ...initialState,
      tracks: [
        { id: "1", name: "Track 1" },
        { id: "2", name: "Track 2" },
      ],
      currentTrack: { id: "2", name: "Track 2" },
      repeat: false,
      isPlaying: true,
    };

    const result = trackReducer(stateWithTracks, { type: "track/nextTrack" });
    expect(result.currentTrack).toBeUndefined();
    expect(result.isPlaying).toBe(false);
    expect(result.elapsed).toBe(0);
  });

  test("should handle prevTrack", () => {
    const stateWithTracks = {
      ...initialState,
      tracks: [
        { id: "1", name: "Track 1" },
        { id: "2", name: "Track 2" },
      ],
      currentTrack: { id: "2", name: "Track 2" },
    };

    const result = trackReducer(stateWithTracks, { type: "track/prevTrack" });
    expect(result.currentTrack?.id).toBe("1");
    expect(result.elapsed).toBe(0);
  });

  test("should handle prevTrack at beginning of playlist", () => {
    const stateWithTracks = {
      ...initialState,
      tracks: [
        { id: "1", name: "Track 1" },
        { id: "2", name: "Track 2" },
      ],
      currentTrack: { id: "1", name: "Track 1" },
    };

    const result = trackReducer(stateWithTracks, { type: "track/prevTrack" });
    expect(result.currentTrack?.id).toBe("2");
    expect(result.elapsed).toBe(0);
  });

  test("should reset to start when elapsed > 2 seconds on prevTrack", () => {
    const stateWithTracks = {
      ...initialState,
      tracks: [
        { id: "1", name: "Track 1" },
        { id: "2", name: "Track 2" },
      ],
      currentTrack: { id: "2", name: "Track 2" },
      elapsed: 5,
    };

    const result = trackReducer(stateWithTracks, { type: "track/prevTrack" });
    expect(result.currentTrack?.id).toBe("2");
    expect(result.seekTime).toBe(0);
  });
});
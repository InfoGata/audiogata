import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ISong } from "../models";
import Local from "../players/local";
import {
  nextTrack,
  setElapsed,
  toggleIsPlaying,
} from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";

const AudioComponent: React.FC = () => {
  const playOnStartup = useSelector(
    (state: AppState) => state.settings.playOnStartup,
  );
  const isPlaying = useSelector((state: AppState) => state.song.isPlaying);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const dispatch = useDispatch<AppDispatch>();
  const volume = useSelector((state: AppState) => state.song.volume);
  const muted = useSelector((state: AppState) => state.song.mute);
  const firstRunRef = useRef(true);
  const firstCurrentSongRef = useRef(true);
  const firstIsPlayingRef = useRef(true);

  const onError = useCallback(
    (err: any, song?: ISong) => {
      // NotAllowedError occurs when autoplay is denied.
      if (err.name === "NotAllowedError") {
        dispatch(setElapsed(0));
        return;
      }

      if (song) {
        const message = `${song.name}: ${err.message}`;
        toast.error(message);
        // tslint:disable-next-line: no-console
        console.log(err);
      }

      dispatch(nextTrack());
    },
    [dispatch],
  );

  const setTrackTimes = (currentTime: number, _: number) => {
    dispatch(setElapsed(currentTime));
  };

  const onSongEnd = () => {
    dispatch(nextTrack());
  };

  const local = useRef(new Local(setTrackTimes, onSongEnd));
  const playSong = useCallback(
    async (song: ISong) => {
      try {
        await local.current.play(song);
      } catch (err) {
        onError(err, song);
      }
    },
    [onError],
  );

  // On App Start up
  useEffect(() => {
    if (firstRunRef.current && playOnStartup && isPlaying) {
      if (currentSong) {
        playSong(currentSong);
      }
    } else if (firstRunRef.current && isPlaying) {
      dispatch(toggleIsPlaying());
    }
    firstRunRef.current = false;
  }, [playOnStartup, isPlaying, currentSong, playSong, dispatch]);

  // On new song
  useEffect(() => {
    const play = async () => {
      local.current.pause();
      if (currentSong) {
        await playSong(currentSong);
      }
    };
    if (!firstCurrentSongRef.current) {
      play();
    } else {
      firstCurrentSongRef.current = false;
    }
  }, [playSong, currentSong, dispatch]);

  // On toggle play/pause
  useEffect(() => {
    const playPause = async () => {
      if (isPlaying) {
        local.current.resume();
        if (!local.current.ready() && currentSong) {
          await playSong(currentSong);
        }
      } else {
        local.current.pause();
      }
    };
    if (!firstIsPlayingRef.current) {
      playPause();
    } else {
      firstIsPlayingRef.current = false;
    }
  }, [isPlaying, currentSong, playSong]);

  // On volume change
  useEffect(() => {
    local.current.setVolume(volume);
  }, [volume]);

  // On mute
  useEffect(() => {
    if (muted) {
      local.current.setVolume(0);
    } else {
      local.current.setVolume(volume);
    }
  }, [muted, volume]);

  return null;
};

export default AudioComponent;

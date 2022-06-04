import { IconButton } from "@mui/material";
import {
  Pause,
  PlayArrow,
  Repeat,
  Shuffle,
  SkipNext,
  SkipPrevious,
} from "@mui/icons-material";
import React from "react";
import {
  nextTrack,
  prevTrack,
  toggleIsPlaying,
  toggleRepeat,
  toggleShuffle,
} from "../store/reducers/trackReducer";
import Volume from "./Volume";
import PlaybackRate from "./PlaybackRate";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const Controls: React.FC = () => {
  const repeat = useAppSelector((state) => state.track.repeat);
  const shuffle = useAppSelector((state) => state.track.shuffle);
  const isPlaying = useAppSelector((state) => state.track.isPlaying);
  const dispatch = useAppDispatch();
  const playIcon = isPlaying ? <Pause /> : <PlayArrow />;

  const onToggleShuffle = () => dispatch(toggleShuffle());
  const onToggleRepeat = () => dispatch(toggleRepeat());
  const onPreviousClick = () => dispatch(prevTrack());
  const onNextClick = () => dispatch(nextTrack());
  const onTogglePlay = () => dispatch(toggleIsPlaying());

  const shuffleColor = shuffle ? "primary" : "inherit";
  const repeatColor = repeat ? "primary" : "inherit";
  return (
    <>
      <IconButton size="small" onClick={onToggleShuffle}>
        <Shuffle color={shuffleColor} />
      </IconButton>
      <IconButton size="small" onClick={onPreviousClick}>
        <SkipPrevious />
      </IconButton>
      <IconButton size="small" onClick={onTogglePlay}>
        {playIcon}
      </IconButton>
      <IconButton size="small" onClick={onNextClick}>
        <SkipNext />
      </IconButton>
      <IconButton size="small" onClick={onToggleRepeat}>
        <Repeat color={repeatColor} />
      </IconButton>
      <Volume />
      <PlaybackRate />
    </>
  );
};

export default Controls;

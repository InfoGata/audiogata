import { IconButton } from "@material-ui/core";
import {
  Pause,
  PlayArrow,
  Repeat,
  Shuffle,
  SkipNext,
  SkipPrevious,
} from "@material-ui/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  nextTrack,
  prevTrack,
  toggleIsPlaying,
  toggleRepeat,
  toggleShuffle,
} from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import Volume from "./Volume";
import PlaybackRate from "./PlaybackRate";

const Controls: React.FC = () => {
  const repeat = useSelector((state: AppState) => state.song.repeat);
  const shuffle = useSelector((state: AppState) => state.song.shuffle);
  const isPlaying = useSelector((state: AppState) => state.song.isPlaying);
  const dispatch = useDispatch<AppDispatch>();
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

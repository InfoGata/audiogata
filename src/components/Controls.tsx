import { IconButton } from "@mui/material";
import {
  Forward10,
  Pause,
  PlayArrow,
  Repeat,
  RepeatOne,
  Replay10,
  Shuffle,
  SkipNext,
  SkipPrevious,
} from "@mui/icons-material";
import React from "react";
import {
  fastFoward,
  nextTrack,
  prevTrack,
  rewind,
  toggleIsPlaying,
  changeRepeat,
  toggleShuffle,
} from "../store/reducers/trackReducer";
import Volume from "./Volume";
import PlaybackRate from "./PlaybackRate";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const Controls: React.FC = () => {
  const repeat = useAppSelector((state) => state.track.repeat);
  const repeatOne = useAppSelector((state) => state.track.repeatOne);
  const shuffle = useAppSelector((state) => state.track.shuffle);
  const isPlaying = useAppSelector((state) => state.track.isPlaying);
  const showForwardAndRewind = useAppSelector(
    (state) => state.settings.showForwardAndRewind
  );
  const dispatch = useAppDispatch();
  const playIcon = isPlaying ? <Pause /> : <PlayArrow />;

  const onToggleShuffle = () => dispatch(toggleShuffle());
  const onChangeRepeat = () => dispatch(changeRepeat());
  const onPreviousClick = () => dispatch(prevTrack());
  const onNextClick = () => dispatch(nextTrack());
  const onTogglePlay = () => dispatch(toggleIsPlaying());
  const onFastFoward = () => dispatch(fastFoward());
  const onRewind = () => dispatch(rewind());

  const shuffleColor = shuffle ? "primary" : "inherit";
  const repeatColor = repeat ? "primary" : "inherit";
  return (
    <>
      <IconButton size="small" onClick={onToggleShuffle}>
        <Shuffle color={shuffleColor} />
      </IconButton>
      {showForwardAndRewind && (
        <IconButton size="small" onClick={onRewind}>
          <Replay10 />
        </IconButton>
      )}
      <IconButton size="small" onClick={onPreviousClick}>
        <SkipPrevious />
      </IconButton>
      <IconButton size="small" onClick={onTogglePlay}>
        {playIcon}
      </IconButton>
      <IconButton size="small" onClick={onNextClick}>
        <SkipNext />
      </IconButton>
      {showForwardAndRewind && (
        <IconButton size="small" onClick={onFastFoward}>
          <Forward10 />
        </IconButton>
      )}
      <IconButton size="small" onClick={onChangeRepeat}>
        {repeatOne ? (
          <RepeatOne color="primary" />
        ) : (
          <Repeat color={repeatColor} />
        )}
      </IconButton>
      <Volume />
      <PlaybackRate />
    </>
  );
};

export default Controls;

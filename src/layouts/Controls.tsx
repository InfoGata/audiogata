import {
  FastForward,
  FastRewind,
  Forward10,
  Forward30,
  Forward5,
  Pause,
  PlayArrow,
  Repeat,
  RepeatOne,
  Replay10,
  Replay30,
  Replay5,
  Shuffle,
  SkipNext,
  SkipPrevious,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  changeRepeat,
  fastFoward,
  nextTrack,
  prevTrack,
  rewind,
  toggleIsPlaying,
  toggleShuffle,
} from "../store/reducers/trackReducer";
import { defaultSkipTime } from "../utils";
import PlaybackRate from "./PlaybackRate";
import Volume from "./Volume";

const getForwardIcon = (time?: number) => {
  if (!time) {
    time = defaultSkipTime;
  }

  switch (time) {
    case 5:
      return <Forward5 />;
    case 10:
      return <Forward10 />;
    case 30:
      return <Forward30 />;
    default:
      return <FastForward />;
  }
};

const getRewindIcon = (time?: number) => {
  if (!time) {
    time = defaultSkipTime;
  }

  switch (time) {
    case 5:
      return <Replay5 />;
    case 10:
      return <Replay10 />;
    case 30:
      return <Replay30 />;
    default:
      return <FastRewind />;
  }
};

const Controls: React.FC = () => {
  const repeat = useAppSelector((state) => state.track.repeat);
  const repeatOne = useAppSelector((state) => state.track.repeatOne);
  const shuffle = useAppSelector((state) => state.track.shuffle);
  const isPlaying = useAppSelector((state) => state.track.isPlaying);
  const showForwardAndRewind = useAppSelector(
    (state) => state.settings.showForwardAndRewind
  );
  const customForwardAndRewindTime = useAppSelector(
    (state) => state.settings.customFowardAndRewindTime
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
          {getRewindIcon(customForwardAndRewindTime)}
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
          {getForwardIcon(customForwardAndRewindTime)}
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

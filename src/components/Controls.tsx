import Pause from "@material-ui/icons/Pause";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Repeat from "@material-ui/icons/Repeat";
import Shuffle from "@material-ui/icons/Shuffle";
import SkipNext from "@material-ui/icons/SkipNext";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
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
    <div>
      <button onClick={onToggleShuffle}>
        <Shuffle color={shuffleColor} />
      </button>
      <button onClick={onToggleRepeat}>
        <Repeat color={repeatColor} />
      </button>
      <button onClick={onPreviousClick}>
        <SkipPrevious />
      </button>
      <button onClick={onTogglePlay}>{playIcon}</button>
      <button onClick={onNextClick}>
        <SkipNext />
      </button>
    </div>
  );
};

export default Controls;

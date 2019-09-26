import Pause from "@material-ui/icons/Pause";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Repeat from "@material-ui/icons/Repeat";
import Shuffle from "@material-ui/icons/Shuffle";
import SkipNext from "@material-ui/icons/SkipNext";
import SkipPrevious from "@material-ui/icons/SkipPrevious";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleRepeat, toggleShuffle } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";

interface IProps {
  backward: () => void;
  foward: () => void;
  togglePlay: () => void;
  isPlaying: boolean;
}

const Controls: React.FC<IProps> = props => {
  const playIcon = props.isPlaying ? <Pause /> : <PlayArrow />;
  const repeat = useSelector((state: AppState) => state.song.repeat);
  const shuffle = useSelector((state: AppState) => state.song.shuffle);
  const dispatch = useDispatch<AppDispatch>();

  const onToggleShuffle = () => {
    dispatch(toggleShuffle());
  };

  const onToggleRepeat = () => {
    dispatch(toggleRepeat());
  };

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
      <button onClick={props.backward}>
        <SkipPrevious />
      </button>
      <button onClick={props.togglePlay}>{playIcon}</button>
      <button onClick={props.foward}>
        <SkipNext />
      </button>
    </div>
  );
};

export default Controls;
